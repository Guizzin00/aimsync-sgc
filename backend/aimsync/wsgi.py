import os
import sys
from django.core.wsgi import get_wsgi_application

# Adiciona a pasta 'backend' ao path do Python para o Vercel conseguir achar o projeto
path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if path not in sys.path:
    sys.path.append(path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aimsync.settings')
application = get_wsgi_application()
app = application
