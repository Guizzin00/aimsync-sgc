import os
import django
import sys

sys.path.append(os.path.abspath('backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aimsync.settings')
django.setup()

from core.models import Produto

try:
    produtos = Produto.objects.all()
    print("Count:", produtos.count())
    for p in produtos:
        print(p.id, p.nome)
except Exception as e:
    import traceback
    traceback.print_exc()
