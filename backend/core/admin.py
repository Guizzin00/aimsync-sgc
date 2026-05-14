from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Cliente, Produto, Venda, ItemVenda

admin.site.register(Usuario, UserAdmin)
admin.site.register(Cliente)
admin.site.register(Produto)
admin.site.register(Venda)
admin.site.register(ItemVenda)
