import os
import django
from django.test import RequestFactory
import sys

sys.path.append(os.path.abspath('backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aimsync.settings')
django.setup()

from core.views import ProdutoViewSet
from core.models import Usuario

factory = RequestFactory()
request = factory.get('/api/produtos/')
# create user
user, _ = Usuario.objects.get_or_create(username='test', defaults={'perfil': 'DONO'})
request.user = user

view = ProdutoViewSet.as_view({'get': 'list'})
response = view(request)
print("Response status:", response.status_code)
