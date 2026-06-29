from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny

from .models import BetMatch, BetVote
from .serializers import (
    BetMatchSerializer, BetMatchCreateSerializer,
    BetVoteSerializer, ResolveMatchSerializer
)


class BetMatchListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = BetMatchSerializer

    def get_queryset(self):
        return BetMatch.objects.prefetch_related('votes').order_by('-created_at')

    def get_serializer_context(self):
        return {'request': self.request}


class BetMatchCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = BetMatchCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        match = serializer.save()
        return Response(BetMatchSerializer(match, context={'request': request}).data, status=status.HTTP_201_CREATED)


class BetMatchDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            match = BetMatch.objects.get(pk=pk)
        except BetMatch.DoesNotExist:
            return Response({'error': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(BetMatchSerializer(match, context={'request': request}).data)


class CastVoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            match = BetMatch.objects.get(pk=pk)
        except BetMatch.DoesNotExist:
            return Response({'error': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)

        if match.status != 'open':
            return Response({'error': 'Match is not open for voting'}, status=status.HTTP_400_BAD_REQUEST)

        if BetVote.objects.filter(match=match, user=request.user).exists():
            return Response({'error': 'You have already voted on this match'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = BetVoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if BetVote.objects.filter(tx_hash=serializer.validated_data['tx_hash']).exists():
            return Response({'error': 'Transaction already used'}, status=status.HTTP_400_BAD_REQUEST)

        BetVote.objects.create(
            match=match,
            user=request.user,
            outcome=serializer.validated_data['outcome'],
            tx_hash=serializer.validated_data['tx_hash'],
        )

        return Response({
            'message': 'Your vote has been recorded!',
            'vote_percentages': match.get_vote_percentages(),
        })


class ResolveMatchView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            match = BetMatch.objects.get(pk=pk)
        except BetMatch.DoesNotExist:
            return Response({'error': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)

        if match.status == 'resolved':
            return Response({'error': 'Match already resolved'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ResolveMatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.validated_data['result']

        match.result = result
        match.status = 'resolved'
        match.save()

        # Award points to winners
        winners = match.votes.filter(outcome=result).select_related('user')
        for vote in winners:
            vote.user.points += match.points_reward
            vote.user.save()

        return Response({
            'message': f'Match resolved. {winners.count()} winners received {match.points_reward} points each.',
            'result': result,
        })


class RecentBetsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        votes = BetVote.objects.select_related('user', 'match').order_by('-created_at')[:10]
        data = []
        for vote in votes:
            data.append({
                'id': vote.id,
                'user': vote.user.username,
                'match': vote.match.title,
                'outcome': vote.outcome,
                'created_at': vote.created_at,
            })
        return Response(data)
