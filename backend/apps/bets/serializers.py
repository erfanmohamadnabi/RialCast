from rest_framework import serializers
from .models import BetMatch, BetVote


class BetMatchSerializer(serializers.ModelSerializer):
    vote_percentages = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()

    class Meta:
        model = BetMatch
        fields = [
            'id', 'title', 'description', 'image', 'points_reward',
            'on_chain_match_id', 'status', 'result',
            'team1_name', 'team2_name',
            'vote_percentages', 'user_vote', 'created_at'
        ]

    def get_vote_percentages(self, obj):
        return obj.get_vote_percentages()

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = obj.votes.filter(user=request.user).first()
            return vote.outcome if vote else None
        return None


class BetMatchCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BetMatch
        fields = ['title', 'description', 'image', 'points_reward', 'team1_name', 'team2_name', 'on_chain_match_id']


class BetVoteSerializer(serializers.Serializer):
    outcome = serializers.ChoiceField(choices=['team1', 'team2', 'draw'])
    tx_hash = serializers.CharField(max_length=66)


class ResolveMatchSerializer(serializers.Serializer):
    result = serializers.ChoiceField(choices=['team1', 'team2', 'draw'])
