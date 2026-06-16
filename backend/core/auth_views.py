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

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserRegistrationSerializer, CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

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
        
        html_message = f"""
        <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    <div style="background-color: #a855f7; padding: 30px 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">AimSync SGC</h1>
                    </div>
                    <div style="padding: 40px 30px; color: #1e293b;">
                        <h2 style="margin-top: 0; color: #0f172a; font-size: 22px;">Redefinição de Senha</h2>
                        <p style="font-size: 16px; line-height: 1.6;">Olá, <strong>{user.first_name or user.username}</strong>!</p>
                        <p style="font-size: 16px; line-height: 1.6; color: #475569;">Você solicitou a redefinição de senha para a sua conta no AimSync SGC. Clique no botão abaixo para criar uma nova senha de forma segura:</p>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="{reset_link}" style="background-color: #a855f7; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(168, 85, 247, 0.25);">Redefinir Minha Senha</a>
                        </div>
                        
                        <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
                        <p style="font-size: 13px; color: #a855f7; word-break: break-all; background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">{reset_link}</p>
                        
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                        <p style="margin: 0; font-size: 14px; color: #94a3b8; text-align: center;">Se você não solicitou essa alteração, basta ignorar este e-mail. Nenhuma alteração será feita na sua conta.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        try:
            send_mail(
                subject='Redefinição de Senha - AimSync SGC',
                message=email_body,
                from_email='noreply@aimsync.com',
                recipient_list=[user.email],
                fail_silently=False,
                html_message=html_message,
            )
        except Exception as e:
            return Response({'detail': f'Erro ao enviar e-mail: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
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

from .serializers import UserRegistrationSerializer

class UserRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Enviar e-mail de verificação
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            verify_link = f"{settings.FRONTEND_URL}/index.html?verify_uid={uid}&verify_token={token}"
            
            email_body = f"Olá, {user.username}!\n\nObrigado por se cadastrar no AimSync SGC.\n\nPor favor, confirme seu e-mail clicando no link abaixo:\n{verify_link}\n\nCaso não tenha sido você, ignore este e-mail."
            
            html_message = f"""
            <html>
                <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                        <div style="background-color: #a855f7; padding: 30px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">AimSync SGC</h1>
                        </div>
                        <div style="padding: 40px 30px; color: #1e293b;">
                            <h2 style="margin-top: 0; color: #0f172a; font-size: 22px;">Confirme seu E-mail</h2>
                            <p style="font-size: 16px; line-height: 1.6;">Olá, <strong>{user.username}</strong>!</p>
                            <p style="font-size: 16px; line-height: 1.6; color: #475569;">Bem-vindo ao AimSync SGC! Estamos quase lá. Para começar a usar sua conta com segurança, por favor, confirme seu endereço de e-mail clicando no botão abaixo:</p>
                            
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="{verify_link}" style="background-color: #a855f7; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(168, 85, 247, 0.25);">Confirmar Meu E-mail</a>
                            </div>
                            
                            <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
                            <p style="font-size: 13px; color: #a855f7; word-break: break-all; background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">{verify_link}</p>
                            
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                            <p style="margin: 0; font-size: 14px; color: #94a3b8; text-align: center;">Caso você não tenha se cadastrado no AimSync, por favor, ignore este e-mail.</p>
                        </div>
                    </div>
                </body>
            </html>
            """
            
            try:
                send_mail(
                    subject='Confirme seu E-mail - AimSync SGC',
                    message=email_body,
                    from_email='noreply@aimsync.com',
                    recipient_list=[user.email],
                    fail_silently=False,
                    html_message=html_message,
                )
                return Response({'message': 'Usuário criado com sucesso. Verifique seu e-mail para ativar a conta.'}, status=status.HTTP_201_CREATED)
            except Exception as e:
                user.delete()  # Deleta o usuário criado para ele poder tentar de novo
                return Response({'detail': f'Erro ao enviar e-mail: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmailVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        
        if not uidb64 or not token:
            return Response({'detail': 'Dados inválidos ou incompletos.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
            
        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({'message': 'E-mail verificado com sucesso! Sua conta está ativa.'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'O link de verificação é inválido ou já expirou.'}, status=status.HTTP_400_BAD_REQUEST)
