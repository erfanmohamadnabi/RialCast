from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from apps.users.models import User
from apps.users.serializers import UserPublicSerializer

class LeaderboardView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        users = User.objects.order_by('-points')[:100]
        data = []
        for rank, user in enumerate(users, 1):
            data.append({
                'rank': rank,
                'id': user.id,
                'username': user.username,
                'avatar': request.build_absolute_uri(user.avatar.url) if user.avatar else None,
                'twitter_link': user.twitter_link,
                'short_wallet': user.get_short_wallet(),
                'points': user.points,
            })
        return Response(data)
