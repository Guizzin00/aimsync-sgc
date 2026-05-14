from django.db import transaction
from decimal import Decimal
from .models import Venda, ItemVenda, Produto
from .exceptions import EstoqueInsuficienteException, BusinessException

class VendaService:
    @staticmethod
    @transaction.atomic
    def registrar_venda(cliente, usuario, itens_data, forma_pagamento='DINHEIRO'):
        """
        Registra uma nova venda, calculando o total e deduzindo o estoque.
        itens_data deve ser uma lista de dicionários: [{'produto_id': int, 'quantidade': int}]
        """
        if not itens_data:
            raise BusinessException("Uma venda deve conter pelo menos um item.")

        venda = Venda.objects.create(
            cliente=cliente,
            usuario=usuario,
            forma_pagamento=forma_pagamento,
            valor_total=Decimal('0.00')
        )

        valor_total = Decimal('0.00')

        for item_data in itens_data:
            try:
                produto = Produto.objects.select_for_update().get(id=item_data['produto_id'])
            except Produto.DoesNotExist:
                raise BusinessException(f"Produto com ID {item_data['produto_id']} não encontrado.")
            
            quantidade = item_data['quantidade']
            if quantidade <= 0:
                raise BusinessException("A quantidade do item deve ser maior que zero.")

            if produto.quantidade_estoque < quantidade:
                raise EstoqueInsuficienteException(
                    produto_nome=produto.nome,
                    quantidade_pedida=quantidade,
                    quantidade_disponivel=produto.quantidade_estoque
                )

            # Deduct stock
            produto.quantidade_estoque -= quantidade
            produto.save()

            # Create ItemVenda
            ItemVenda.objects.create(
                venda=venda,
                produto=produto,
                quantidade=quantidade,
                valor_unitario=produto.preco
            )

            valor_total += (produto.preco * quantidade)

        venda.valor_total = valor_total
        venda.save()

        return venda
