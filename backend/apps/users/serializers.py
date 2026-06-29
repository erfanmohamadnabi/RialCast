from rest_framework import serializers
from .models import User


class UserPublicSerializer(serializers.ModelSerializer):
    """Public profile - no wallet address"""
    short_wallet = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'twitter_link', 'github_link', 'points', 'short_wallet']

    def get_short_wallet(self, obj):
        return obj.get_short_wallet()


class UserPrivateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar', 'twitter_link', 'github_link', 'points', 'wallet_address', 'is_staff']
        read_only_fields = ['wallet_address', 'points', 'is_staff']


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'avatar', 'twitter_link', 'github_link']


class WalletAuthSerializer(serializers.Serializer):
    wallet_address = serializers.CharField(max_length=42)
    signature = serializers.CharField()
    nonce = serializers.CharField()


class NonceSerializer(serializers.Serializer):
    wallet_address = serializers.CharField(max_length=42)
