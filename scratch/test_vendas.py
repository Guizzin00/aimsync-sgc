import os
import django
from django.test import RequestFactory
import sys

sys.path.append(os.path.abspath('backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aimsync.settings')
django.setup()

from core.views import VendaViewSet
from core.models import Usuario

factory = RequestFactory()
request = factory.get('/api/vendas/')
user, _ = Usuario.objects.get_or_create(username='testdono', defaults={'perfil': 'DONO'})
request.user = user

view = VendaViewSet.as_view({'get': 'list'})
try:
    response = view(request)
    print("VendaViewSet list:", response.status_code)
except Exception as e:
    print("VendaViewSet Error:", str(e))
