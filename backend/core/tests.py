from django.test import TestCase
from decimal import Decimal
from django.contrib.auth import get_user_model
from core.models import Cliente, Produto, Venda, ItemVenda
from core.services import VendaService
from core.exceptions import EstoqueInsuficienteException, BusinessException

User = get_user_model()

class VendaServiceTests(TestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(username='testuser', password='password123', perfil='FUNCIONARIO')
        self.cliente = Cliente.objects.create(
            nome='João Silva',
            cpf='12345678901',
            email='joao@email.com'
        )
        self.produto1 = Produto.objects.create(
            nome='Mouse',
            preco=Decimal('50.00'),
            quantidade_estoque=10
        )
        self.produto2 = Produto.objects.create(
            nome='Teclado',
            preco=Decimal('100.00'),
            quantidade_estoque=5
        )

    def test_registrar_venda_sucesso(self):
        itens_data = [
            {'produto_id': self.produto1.id, 'quantidade': 2},
            {'produto_id': self.produto2.id, 'quantidade': 1}
        ]

        venda = VendaService.registrar_venda(self.cliente, self.usuario, itens_data, 'CREDITO')

        # Refresh from db
        self.produto1.refresh_from_db()
        self.produto2.refresh_from_db()

        self.assertEqual(venda.valor_total, Decimal('200.00')) # (50 * 2) + (100 * 1)
        self.assertEqual(self.produto1.quantidade_estoque, 8)
        self.assertEqual(self.produto2.quantidade_estoque, 4)
        self.assertEqual(venda.itens.count(), 2)

    def test_registrar_venda_estoque_insuficiente(self):
        itens_data = [
            {'produto_id': self.produto1.id, 'quantidade': 15} # Only 10 available
        ]

        with self.assertRaises(EstoqueInsuficienteException):
            VendaService.registrar_venda(self.cliente, self.usuario, itens_data, 'PIX')
        
        self.produto1.refresh_from_db()
        self.assertEqual(self.produto1.quantidade_estoque, 10) # Stock shouldn't be deducted
        self.assertEqual(Venda.objects.count(), 0) # Sale shouldn't be registered

    def test_venda_sem_itens(self):
        with self.assertRaises(BusinessException):
            VendaService.registrar_venda(self.cliente, self.usuario, [], 'DINHEIRO')
