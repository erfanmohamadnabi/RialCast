from django.contrib import admin
from .models import SpinResult, DiceResult

@admin.register(SpinResult)
class SpinResultAdmin(admin.ModelAdmin):
    list_display = ['user', 'result_segment', 'points_earned', 'tx_hash', 'created_at']
    list_filter = ['result_segment']


@admin.register(DiceResult)
class DiceResultAdmin(admin.ModelAdmin):
    list_display = ['user', 'dice_value', 'points_earned', 'tx_hash', 'created_at']
    list_filter = ['dice_value']
