from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum

from .models import Cliente, Produto, Venda
from .serializers import ClienteSerializer, ProdutoSerializer, VendaSerializer, VendaCreateSerializer
from .services import VendaService
from .exceptions import BusinessException

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.vendas.exists():
            raise BusinessException("Não é possível excluir um cliente que possui vendas registradas.")
        return super().destroy(request, *args, **kwargs)

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.itens_venda.exists():
            raise BusinessException("Não é possível excluir um produto que possui vendas registradas.")
        return super().destroy(request, *args, **kwargs)

class VendaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Venda.objects.all().order_by('-data')
    serializer_class = VendaSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = VendaCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            cliente = Cliente.objects.get(id=serializer.validated_data['cliente_id'])
        except Cliente.DoesNotExist:
            raise BusinessException("Cliente não encontrado.")

        venda = VendaService.registrar_venda(
            cliente=cliente,
            usuario=request.user,
            itens_data=serializer.validated_data['itens'],
            forma_pagamento=serializer.validated_data['forma_pagamento']
        )
        
        return Response(VendaSerializer(venda).data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def relatorio_vendas(request):
    data_inicio = request.query_params.get('data_inicio')
    data_fim = request.query_params.get('data_fim')
    cliente_id = request.query_params.get('cliente_id')

    vendas = Venda.objects.all()
    if data_inicio:
        vendas = vendas.filter(data__date__gte=data_inicio)
    if data_fim:
        vendas = vendas.filter(data__date__lte=data_fim)
    if cliente_id:
        vendas = vendas.filter(cliente_id=cliente_id)

    total_vendido = vendas.aggregate(Sum('valor_total'))['valor_total__sum'] or 0

    return Response({
        'total_vendas': vendas.count(),
        'valor_total_vendido': total_vendido,
        'vendas': VendaSerializer(vendas, many=True).data
    })
