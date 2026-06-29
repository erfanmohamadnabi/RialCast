from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import SpinResult
from .serializers import SpinResultSerializer, SpinSubmitSerializer


SEGMENT_POINTS = {1: 10, 2: 20, 3: 5, 4: 50, 5: 15, 6: 30, 7: 100, 8: 0}


class SpinSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SpinSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        tx_hash = serializer.validated_data['tx_hash']
        segment = serializer.validated_data['result_segment']

        if SpinResult.objects.filter(tx_hash=tx_hash).exists():
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
