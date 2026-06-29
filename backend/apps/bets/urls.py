from django.urls import path
from . import views

urlpatterns = [
    path('', views.BetMatchListView.as_view(), name='bet-list'),
    path('create/', views.BetMatchCreateView.as_view(), name='bet-create'),
    path('<int:pk>/', views.BetMatchDetailView.as_view(), name='bet-detail'),
    path('<int:pk>/vote/', views.CastVoteView.as_view(), name='cast-vote'),
    path('<int:pk>/resolve/', views.ResolveMatchView.as_view(), name='resolve-match'),
    path('recent/', views.RecentBetsView.as_view(), name='recent-bets'),
]
