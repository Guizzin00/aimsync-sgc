import os
import django
from django.test import RequestFactory
import sys

sys.path.append(os.path.abspath('backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aimsync.settings')
django.setup()

from core.views import ProdutoViewSet, ClienteViewSet
from core.models import Usuario

factory = RequestFactory()
request = factory.get('/api/produtos/')
user, _ = Usuario.objects.get_or_create(username='testdono', defaults={'perfil': 'DONO'})
request.user = user

view = ProdutoViewSet.as_view({'get': 'list'})
try:
    response = view(request)
    print("ProdutoViewSet list:", response.status_code)
except Exception as e:
    print("ProdutoViewSet Error:", str(e))

view2 = ClienteViewSet.as_view({'get': 'list'})
try:
    response2 = view2(request)
    print("ClienteViewSet list:", response2.status_code)
except Exception as e:
    print("ClienteViewSet Error:", str(e))
