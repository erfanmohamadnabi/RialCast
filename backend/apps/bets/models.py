from django.db import models
from django.conf import settings


class BetMatch(models.Model):
    OUTCOME_CHOICES = [
        ('team1', 'Team 1 Win'),
        ('team2', 'Team 2 Win'),
        ('draw', 'Draw'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
        ('resolved', 'Resolved'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='bet_matches/', null=True, blank=True)
    points_reward = models.IntegerField(default=100)
    on_chain_match_id = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    result = models.CharField(max_length=10, choices=OUTCOME_CHOICES, null=True, blank=True)
    team1_name = models.CharField(max_length=100, default='Team 1')
    team2_name = models.CharField(max_length=100, default='Team 2')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def get_vote_percentages(self):
        total = self.votes.count()
        if total == 0:
            return {'team1': 0, 'team2': 0, 'draw': 0, 'total': 0}
        team1 = self.votes.filter(outcome='team1').count()
        team2 = self.votes.filter(outcome='team2').count()
        draw = self.votes.filter(outcome='draw').count()
        return {
            'team1': round(team1 / total * 100),
            'team2': round(team2 / total * 100),
            'draw': round(draw / total * 100),
            'total': total,
        }


class BetVote(models.Model):
    OUTCOME_CHOICES = [
        ('team1', 'Team 1 Win'),
        ('team2', 'Team 2 Win'),
        ('draw', 'Draw'),
    ]

    match = models.ForeignKey(BetMatch, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bet_votes')
    outcome = models.CharField(max_length=10, choices=OUTCOME_CHOICES)
    tx_hash = models.CharField(max_length=66, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['match', 'user']

    def __str__(self):
        return f"{self.user} voted {self.outcome} on {self.match}"
