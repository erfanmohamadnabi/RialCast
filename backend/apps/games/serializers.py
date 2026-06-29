from rest_framework import serializers
from .models import SpinResult


class SpinResultSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = SpinResult
        fields = ['id', 'username', 'tx_hash', 'result_segment', 'points_earned', 'created_at']
        read_only_fields = ['points_earned']


class SpinSubmitSerializer(serializers.Serializer):
    tx_hash = serializers.CharField(max_length=66)
    result_segment = serializers.IntegerField(min_value=1, max_value=8)
