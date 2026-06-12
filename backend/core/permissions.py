from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Permite acesso apenas a usuários com o perfil DONO.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.perfil == 'DONO')
