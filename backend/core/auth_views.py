from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'detail': 'E-mail é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'message': 'Se o e-mail existir no nosso sistema, um link de redefinição será enviado.'}, status=status.HTTP_200_OK)
        
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        
        reset_link = f"{settings.FRONTEND_URL}/index.html?uid={uid}&token={token}"
        
        email_body = f"Olá, {user.first_name or user.username}!\n\nVocê solicitou a redefinição de senha para o AimSync SGC.\n\nPor favor, copie e cole o link abaixo no seu navegador para criar uma nova senha:\n{reset_link}\n\nSe você não solicitou isso, pode ignorar este e-mail."
        
        send_mail(
            subject='Redefinição de Senha - AimSync SGC',
            message=email_body,
            from_email='noreply@aimsync.com',
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        return Response({'message': 'Se o e-mail existir no nosso sistema, um link de redefinição será enviado.'}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not uidb64 or not token or not new_password:
            return Response({'detail': 'Dados inválidos ou incompletos.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
            
        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Senha redefinida com sucesso!'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'O link de redefinição é inválido ou já expirou.'}, status=status.HTTP_400_BAD_REQUEST)
