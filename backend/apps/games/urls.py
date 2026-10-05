from django.urls import path
from . import views

urlpatterns = [
    path('spin/submit/', views.SpinSubmitView.as_view(), name='spin-submit'),
    path('spin/recent/', views.RecentSpinsView.as_view(), name='spin-recent'),
    path('dice/submit/', views.DiceSubmitView.as_view(), name='dice-submit'),
    path('dice/recent/', views.RecentDiceView.as_view(), name='dice-recent'),
]
