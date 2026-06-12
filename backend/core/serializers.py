from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Usuario, Cliente, Produto, Venda, ItemVenda

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['perfil'] = self.user.perfil
        data['username'] = self.user.username
        return data

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'perfil']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Usuario
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = Usuario.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_active=False  # Requer verificação de e-mail
        )
        return user

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = '__all__'

class ItemVendaSerializer(serializers.ModelSerializer):
    produto_nome = serializers.ReadOnlyField(source='produto.nome')

    class Meta:
        model = ItemVenda
        fields = ['id', 'produto', 'produto_nome', 'quantidade', 'valor_unitario']
        read_only_fields = ['valor_unitario']

class VendaSerializer(serializers.ModelSerializer):
    itens = ItemVendaSerializer(many=True, read_only=True)
    cliente_nome = serializers.ReadOnlyField(source='cliente.nome')
    usuario_nome = serializers.ReadOnlyField(source='usuario.username')

    class Meta:
        model = Venda
        fields = ['id', 'data', 'valor_total', 'forma_pagamento', 'cliente', 'cliente_nome', 'usuario', 'usuario_nome', 'itens']
        read_only_fields = ['data', 'valor_total', 'usuario']

class ItemVendaCreateSerializer(serializers.Serializer):
    produto_id = serializers.IntegerField()
    quantidade = serializers.IntegerField(min_value=1)

class VendaCreateSerializer(serializers.Serializer):
    cliente_id = serializers.IntegerField()
    forma_pagamento = serializers.CharField(max_length=20)
    itens = ItemVendaCreateSerializer(many=True)
