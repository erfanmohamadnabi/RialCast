import secrets
import hashlib
from eth_account import Account
from eth_account.messages import encode_defunct

from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    UserPublicSerializer, UserPrivateSerializer,
    UserUpdateSerializer, WalletAuthSerializer, NonceSerializer
)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class GetNonceView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = NonceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        wallet = serializer.validated_data['wallet_address'].lower()

        user, _ = User.objects.get_or_create(
            wallet_address=wallet,
            defaults={'username': wallet[:8] + '...'}
        )
        nonce = secrets.token_hex(16)
        user.nonce = nonce
        user.save()

        return Response({'nonce': nonce, 'message': f'Sign this nonce to authenticate: {nonce}'})


class WalletAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = WalletAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        wallet = serializer.validated_data['wallet_address'].lower()
        signature = serializer.validated_data['signature']
        nonce = serializer.validated_data['nonce']

        try:
            user = User.objects.get(wallet_address=wallet)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if user.nonce != nonce:
            return Response({'error': 'Invalid nonce'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            message = encode_defunct(text=f'Sign this nonce to authenticate: {nonce}')
            recovered = Account.recover_message(message, signature=signature)
            if recovered.lower() != wallet:
                return Response({'error': 'Signature verification failed'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Clear nonce after use
        user.nonce = None
        user.save()

        tokens = get_tokens_for_user(user)
        return Response({
            'tokens': tokens,
            'user': UserPrivateSerializer(user).data
        })


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserPrivateSerializer(request.user).data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserPrivateSerializer(request.user).data)


class PublicProfileView(generics.RetrieveAPIView):
    """Public profile by user ID - no wallet address exposed"""
    permission_classes = [AllowAny]
    serializer_class = UserPublicSerializer
    queryset = User.objects.all()


class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        from django.contrib.auth import authenticate
        user = authenticate(username=username, password=password)

        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_staff:
            return Response({'error': 'Not an admin'}, status=status.HTTP_403_FORBIDDEN)

        tokens = get_tokens_for_user(user)
        return Response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': {
                'id': user.id,
                'username': user.username,
                'is_staff': user.is_staff,
            }
        })