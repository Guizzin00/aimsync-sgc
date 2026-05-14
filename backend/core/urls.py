from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, ProdutoViewSet, VendaViewSet, relatorio_vendas

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'produtos', ProdutoViewSet)

venda_list = VendaViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
venda_detail = VendaViewSet.as_view({
    'get': 'retrieve'
})

urlpatterns = [
    path('', include(router.urls)),
    path('vendas/', venda_list, name='venda-list'),
    path('vendas/<int:pk>/', venda_detail, name='venda-detail'),
    path('relatorios/vendas/', relatorio_vendas, name='relatorio-vendas'),
]
