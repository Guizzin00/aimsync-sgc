from rest_framework import viewsets, status, permissions, mixins
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum

from .models import Cliente, Produto, Venda, Usuario, ConfiguracaoLoja
from .serializers import ClienteSerializer, ProdutoSerializer, VendaSerializer, VendaCreateSerializer, UsuarioSerializer, ConfiguracaoLojaSerializer
from .services import VendaService
from .exceptions import BusinessException
from .permissions import IsAdmin

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by('username')
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def destroy(self, request, *args, **kwargs):
        # Soft delete (Desativar) em vez de excluir do banco
        instance = self.get_object()
        if instance == request.user:
            raise BusinessException("Você não pode desativar seu próprio usuário logado.")
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ConfiguracaoLojaViewSet(viewsets.ModelViewSet):
    queryset = ConfiguracaoLoja.objects.all()
    serializer_class = ConfiguracaoLojaSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return super().get_permissions()

    def list(self, request, *args, **kwargs):
        # Sempre retorna ou cria a única configuração
        config, created = ConfiguracaoLoja.objects.get_or_create(id=1)
        serializer = self.get_serializer(config)
        return Response([serializer.data])

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'destroy':
            return [IsAdmin()]
        return super().get_permissions()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.vendas.exists():
            raise BusinessException("Não é possível excluir um cliente que possui vendas registradas.")
        return super().destroy(request, *args, **kwargs)

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'destroy':
            return [IsAdmin()]
        return super().get_permissions()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.itens_venda.exists():
            raise BusinessException("Não é possível excluir um produto que possui vendas registradas.")
        return super().destroy(request, *args, **kwargs)

class VendaViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.ListModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = Venda.objects.all().order_by('-data')
    serializer_class = VendaSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'destroy':
            return [IsAdmin()]
        return super().get_permissions()

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
@permission_classes([IsAuthenticated, IsAdmin])
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
