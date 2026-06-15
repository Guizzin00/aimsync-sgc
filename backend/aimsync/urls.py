from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from core.auth_views import PasswordResetRequestView, PasswordResetConfirmView, UserRegistrationView, EmailVerificationView, CustomTokenObtainPairView

from django.core.management import call_command
from django.http import HttpResponse

def run_migrations(request):
    try:
        call_command('migrate')
        return HttpResponse("Migrações concluídas com sucesso no banco do Vercel!")
    except Exception as e:
        return HttpResponse(f"Erro ao migrar: {str(e)}")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/register/', UserRegistrationView.as_view(), name='user_register'),
    path('api/auth/verify-email/', EmailVerificationView.as_view(), name='verify_email'),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('api/auth/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('api/migrate/', run_migrations, name='run_migrations'),
    path('api/', include('core.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
