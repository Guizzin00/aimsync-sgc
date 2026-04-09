# AimSync - Sistema de Gestão Comercial (SGC)

Sistema de Gestão Comercial para Pequenos Negócios, desenvolvido para auxiliar o controle de operações diárias em comércios como lojas de informática, papelarias, livrarias e assistências técnicas.

## Sobre o Projeto

O **AimSync** é uma plataforma web completa que integra o gerenciamento de clientes, produtos, vendas e relatórios em um único sistema. A aplicação utiliza uma API REST protegida por autenticação JWT, garantindo segurança e controle de acesso por perfis (ADMIN e FUNCIONÁRIO).

## Tecnologias

- **Backend:** Python / Django / Django REST Framework
- **Autenticação:** JWT (JSON Web Token)
- **Banco de Dados:** PostgreSQL
- **Frontend:** Interface Web (Django Templates + JavaScript consumindo a API REST)
- **Versionamento:** Git / GitHub

## Funcionalidades

- Gestão de Clientes (CRUD completo com validação de CPF único)
- Gestão de Produtos (CRUD completo com controle de estoque)
- Registro de Vendas (com cálculo automático e atualização de estoque)
- Autenticação e Autorização (JWT com perfis ADMIN/FUNCIONÁRIO)
- Relatórios de Vendas (por período, por cliente, gráficos anuais)

## Estrutura do Repositório

```
projeto/
├── README.md
├── docs/
│   └── ENTREGA_1_Documentacao.md
└── database/
    └── script_criacao.sql
```

## Como Executar

_(Instruções serão adicionadas nas próximas entregas)_

## Equipe

- Aluno 1
- Aluno 2
- Aluno 3
