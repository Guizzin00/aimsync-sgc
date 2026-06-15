from django.db import models
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
    PERFIL_CHOICES = (
        ('DONO', 'Dono da Loja'),
        ('FUNCIONARIO', 'Funcionário'),
    )
    perfil = models.CharField(max_length=50, choices=PERFIL_CHOICES, default='FUNCIONARIO')

class ConfiguracaoLoja(models.Model):
    nome_loja = models.CharField(max_length=255, default="AimSync SGC")
    cnpj = models.CharField(max_length=18, blank=True, null=True)
    mensagem_rodape = models.TextField(blank=True, null=True, default="Obrigado pela preferência!")
    imposto_padrao = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text="Porcentagem de imposto padrão")

    def __str__(self):
        return self.nome_loja

    def save(self, *args, **kwargs):
        # Garante que seja um Singleton (Apenas 1 registro na tabela)
        if self.__class__.objects.count():
            self.pk = self.__class__.objects.first().pk
        super().save(*args, **kwargs)

class Cliente(models.Model):
    nome = models.CharField(max_length=255)
    cpf = models.CharField(max_length=14, unique=True)
    email = models.EmailField(max_length=255)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    endereco = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nome

class Produto(models.Model):
    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    quantidade_estoque = models.PositiveIntegerField(default=0)
    estoque_minimo = models.PositiveIntegerField(default=5)
    imagem = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nome

class Venda(models.Model):
    FORMA_PAGAMENTO_CHOICES = (
        ('CREDITO', 'Cartão de Crédito'),
        ('DEBITO', 'Cartão de Débito'),
        ('PIX', 'PIX'),
        ('DINHEIRO', 'Dinheiro'),
    )

    data = models.DateTimeField(auto_now_add=True)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    forma_pagamento = models.CharField(max_length=20, choices=FORMA_PAGAMENTO_CHOICES, default='DINHEIRO')
    cliente = models.ForeignKey(Cliente, on_delete=models.RESTRICT, related_name='vendas')
    usuario = models.ForeignKey(Usuario, on_delete=models.RESTRICT, related_name='vendas')

    def __str__(self):
        return f"Venda {self.id} - {self.data.strftime('%d/%m/%Y')}"

class ItemVenda(models.Model):
    venda = models.ForeignKey(Venda, on_delete=models.CASCADE, related_name='itens')
    produto = models.ForeignKey(Produto, on_delete=models.RESTRICT, related_name='itens_venda')
    quantidade = models.PositiveIntegerField()
    valor_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantidade}x {self.produto.nome}"
