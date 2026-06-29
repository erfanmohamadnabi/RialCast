from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('nonce/', views.GetNonceView.as_view(), name='get-nonce'),
    path('auth/', views.WalletAuthView.as_view(), name='wallet-auth'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/<int:pk>/', views.PublicProfileView.as_view(), name='public-profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('admin-login/', views.AdminLoginView.as_view(), name='admin-login'),
]
