from django.contrib import admin
from .models import SpinResult

@admin.register(SpinResult)
class SpinResultAdmin(admin.ModelAdmin):
    list_display = ['user', 'result_segment', 'points_earned', 'tx_hash', 'created_at']
    list_filter = ['result_segment']
