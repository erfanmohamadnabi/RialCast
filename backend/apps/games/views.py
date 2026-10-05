from django.db import IntegrityError, transaction
from django.db.models import F
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import SpinResult, DiceResult
from .serializers import (
    SpinResultSerializer, SpinSubmitSerializer,
    DiceResultSerializer, DiceSubmitSerializer,
)
from .dice import DICE_POINTS, derive_dice_value


SEGMENT_POINTS = {1: 10, 2: 20, 3: 5, 4: 50, 5: 15, 6: 30, 7: 100, 8: 0}


class SpinSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SpinSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        tx_hash = serializer.validated_data['tx_hash']
        segment = serializer.validated_data['result_segment']

        if (SpinResult.objects.filter(tx_hash=tx_hash).exists()
                or DiceResult.objects.filter(tx_hash__iexact=tx_hash).exists()):
            return Response({'error': 'Transaction already processed'}, status=status.HTTP_400_BAD_REQUEST)

        points = SEGMENT_POINTS.get(segment, 0)
        spin = SpinResult.objects.create(
            user=request.user,
            tx_hash=tx_hash,
            result_segment=segment,
            points_earned=points,
        )

        request.user.points += points
        request.user.save()

        return Response({
            'spin': SpinResultSerializer(spin).data,
            'points_earned': points,
            'total_points': request.user.points,
        })


class RecentSpinsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        spins = SpinResult.objects.select_related('user').order_by('-created_at')[:10]
        return Response(SpinResultSerializer(spins, many=True).data)


class DiceSubmitView(APIView):
    """
    Records a dice roll. The roll uses a SpinGame.spin() transaction: the client
    sends the tx hash and the on-chain result from the `Spun` event, and the
    dice face + points are derived server-side (see dice.py).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DiceSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        tx_hash = serializer.validated_data['tx_hash'].lower()
        spin_result = serializer.validated_data['spin_result']

        # The same transaction can only be claimed once, in either game.
        if (DiceResult.objects.filter(tx_hash__iexact=tx_hash).exists()
                or SpinResult.objects.filter(tx_hash__iexact=tx_hash).exists()):
            return Response({'error': 'Transaction already processed'}, status=status.HTTP_400_BAD_REQUEST)

        dice_value = derive_dice_value(tx_hash, spin_result)
        points = DICE_POINTS[dice_value]

        try:
            with transaction.atomic():
                roll = DiceResult.objects.create(
                    user=request.user,
                    tx_hash=tx_hash,
                    spin_result=spin_result,
                    dice_value=dice_value,
                    points_earned=points,
                )
                type(request.user).objects.filter(pk=request.user.pk).update(points=F('points') + points)
        except IntegrityError:
            return Response({'error': 'Transaction already processed'}, status=status.HTTP_400_BAD_REQUEST)

        request.user.refresh_from_db(fields=['points'])

        return Response({
            'roll': DiceResultSerializer(roll).data,
            'dice_value': dice_value,
            'points_earned': points,
            'total_points': request.user.points,
        })


class RecentDiceView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        rolls = DiceResult.objects.select_related('user').order_by('-created_at')[:10]
        return Response(DiceResultSerializer(rolls, many=True).data)
