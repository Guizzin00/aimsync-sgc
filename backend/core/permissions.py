from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Permite acesso apenas a usuários com o perfil ADMIN.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.perfil == 'ADMIN')
