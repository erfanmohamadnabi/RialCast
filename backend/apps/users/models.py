from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    wallet_address = models.CharField(max_length=42, unique=True, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    twitter_link = models.URLField(null=True, blank=True)
    github_link = models.URLField(null=True, blank=True)
    points = models.IntegerField(default=0)
    nonce = models.CharField(max_length=64, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'wallet_address'
    REQUIRED_FIELDS = ['username']

    class Meta:
        ordering = ['-points']

    def __str__(self):
        return self.wallet_address or self.username

    def get_short_wallet(self):
        if self.wallet_address:
            return f"{self.wallet_address[:6]}...{self.wallet_address[-4:]}"
        return ""
