# AimSync - Sistema de Gestão Comercial (SGC) - ENTREGA 3

Sistema de Gestão Comercial para Pequenos Negócios, desenvolvido para auxiliar o controle de operações diárias em comércios como lojas de informática, papelarias, livrarias e assistências técnicas.

## Sobre o Projeto

O **AimSync** é uma plataforma web completa que integra o gerenciamento de clientes, produtos, vendas e relatórios em um único sistema. A aplicação utiliza uma API REST (Django REST Framework) protegida por autenticação JWT, garantindo segurança e controle de acesso.

Nesta **Entrega 3 Final**, o sistema inclui recuperação de senha real via E-mail (SMTP), fluxo de registro e verificação de contas, além de configurações nativas para deploy na Vercel com banco de dados PostgreSQL (Supabase).

## Tecnologias

- **Backend:** Python / Django / Django REST Framework
- **Autenticação:** JWT (JSON Web Token)
- **Banco de Dados:** SQLite (Desenvolvimento) / PostgreSQL (Produção - Supabase)
- **Versionamento:** Git / GitHub
- **Hospedagem (Opcional):** Vercel

## Como Executar o Projeto Localmente

### 1. Pré-requisitos
- Python 3.10+ instalado no PATH
- Git

### 2. Passo a Passo

```bash
# Clone o repositório
git clone <url-do-seu-repositorio>

# Acesse a pasta do projeto
cd aimsync-sgc-main

# (Opcional, porém recomendado) Crie e ative um ambiente virtual
python -m venv venv
# No Windows:
venv\Scripts\activate
# No Linux/Mac:
# source venv/bin/activate

# Instale as dependências listadas
pip install -r requirements.txt

# Acesse a pasta do backend
cd backend

# Execute as migrações para criar as tabelas no banco de dados SQLite
python manage.py makemigrations core
python manage.py migrate

# Crie um superusuário para poder acessar e fazer login no sistema
python manage.py createsuperuser

# Inicie o servidor de desenvolvimento
python manage.py runserver
```

A API estará disponível em `http://127.0.0.1:8000/api/`.

### 3. Rodando os Testes Automatizados
```bash
python manage.py test core
```

### 4. Endpoints Principais
Você pode utilizar o Postman ou o Insomnia para interagir com a API:

- **Autenticação:** 
  - `POST /api/auth/login/` (Envie `username` e `password` para receber o Token JWT)
  - `POST /api/auth/refresh/`
- **CRUD:**
  - `GET, POST, PUT, DELETE /api/clientes/`
  - `GET, POST, PUT, DELETE /api/produtos/`
- **Vendas & Relatórios:**
  - `GET, POST /api/vendas/`
  - `GET /api/relatorios/vendas/` (Filtros: `data_inicio`, `data_fim`, `cliente_id`)

## Equipe
- Guilherme Oliveira
