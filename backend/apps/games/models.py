from django.db import models
from django.conf import settings


class SpinResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='spin_results')
    tx_hash = models.CharField(max_length=66, unique=True)
    result_segment = models.IntegerField()  # 1-8
    points_earned = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    SEGMENT_POINTS = {
        1: 10,
        2: 20,
        3: 5,
        4: 50,
        5: 15,
        6: 30,
        7: 100,
        8: 0,
    }

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} spun {self.result_segment} - {self.points_earned}pts"
