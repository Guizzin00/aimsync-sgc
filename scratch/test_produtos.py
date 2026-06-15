import os
import django
from rest_framework.test import APIRequestFactory, force_authenticate
import sys

sys.path.append(os.path.abspath('backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aimsync.settings')
django.setup()

from core.views import ProdutoViewSet
from core.models import Usuario

factory = APIRequestFactory()
request = factory.get('/api/produtos/')
user, _ = Usuario.objects.get_or_create(username='testdono', defaults={'perfil': 'DONO'})
force_authenticate(request, user=user)

view = ProdutoViewSet.as_view({'get': 'list'})
try:
    response = view(request)
    print("ProdutoViewSet list:", response.status_code)
    print("Response Data:", response.data if hasattr(response, 'data') else response.content)
except Exception as e:
    import traceback
    print("ProdutoViewSet Error:")
    traceback.print_exc()
