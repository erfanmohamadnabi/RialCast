from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['wallet_address', 'username', 'points', 'created_at']
    list_filter = ['is_staff', 'is_active']
    search_fields = ['wallet_address', 'username']
    ordering = ['-points']
    fieldsets = UserAdmin.fieldsets + (
        ('Web3 Info', {'fields': ('wallet_address', 'nonce', 'points', 'avatar', 'twitter_link', 'github_link')}),
    )
