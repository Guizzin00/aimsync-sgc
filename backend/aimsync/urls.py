from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from core.auth_views import PasswordResetRequestView, PasswordResetConfirmView, UserRegistrationView, EmailVerificationView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/register/', UserRegistrationView.as_view(), name='user_register'),
    path('api/auth/verify-email/', EmailVerificationView.as_view(), name='verify_email'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('api/auth/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('api/', include('core.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
