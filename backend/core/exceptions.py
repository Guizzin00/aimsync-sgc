from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException
from rest_framework import status

class BusinessException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Erro de negócio.'
    default_code = 'business_error'

    def __init__(self, detail, status_code=None):
        if status_code is not None:
            self.status_code = status_code
        super().__init__(detail=detail)

class EstoqueInsuficienteException(BusinessException):
    def __init__(self, produto_nome, quantidade_pedida, quantidade_disponivel):
        detail = f"Estoque insuficiente para o produto '{produto_nome}'. Solicitado: {quantidade_pedida}, Disponível: {quantidade_disponivel}."
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST)

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        response.data['status_code'] = response.status_code
        if isinstance(exc, BusinessException):
            response.data['error_type'] = 'BusinessException'

    return response
