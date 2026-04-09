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

## Documentação

- [📄 Documento de Entrega 1 (Google Docs)](https://docs.google.com/document/d/1ignLpRMEzUtgRwZCkQrccoYJ-siLkP5eiaNFfkjMW6E/edit?usp=sharing)
- [📊 Diagrama de Classes UML (PDF)](docs/AimSync%20-%20Diagrama%20de%20Classes%20(UML).pdf)
- [📊 Diagrama Lógico do Banco de Dados (PDF)](docs/AimSync%20-%20Diagrama%20L%C3%B3gico%20do%20Banco%20de%20Dados.pdf)

## Como Executar

_(Instruções serão adicionadas nas próximas entregas)_

## Equipe

- Guilherme Oliveira
