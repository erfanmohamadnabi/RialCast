from django.contrib import admin
from .models import BetMatch, BetVote

@admin.register(BetMatch)
class BetMatchAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'result', 'points_reward', 'created_at']
    list_filter = ['status']
    actions = ['close_match']

@admin.register(BetVote)
class BetVoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'match', 'outcome', 'created_at']
    list_filter = ['outcome']
