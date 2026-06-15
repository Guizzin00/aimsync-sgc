-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS (POSTGRESQL)
-- SISTEMA DE GESTÃO COMERCIAL (AIMSYNC SGC)

-- 1. Criação da tabela de Usuários (Baseada no AbstractUser do Django)
CREATE TABLE core_usuario (
    id SERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE NULL,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    date_joined TIMESTAMP WITH TIME ZONE NOT NULL,
    perfil VARCHAR(50) NOT NULL DEFAULT 'FUNCIONARIO'
);

-- 2. Criação da tabela de Clientes
CREATE TABLE core_cliente (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NULL,
    endereco VARCHAR(255) NULL
);

-- 3. Criação da tabela de Produtos
CREATE TABLE core_produto (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NULL,
    preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
    quantidade_estoque INTEGER NOT NULL DEFAULT 0,
    estoque_minimo INTEGER NOT NULL DEFAULT 5,
    imagem TEXT NULL
);

-- 4. Criação da tabela de Vendas
CREATE TABLE core_venda (
    id SERIAL PRIMARY KEY,
    data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    valor_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    forma_pagamento VARCHAR(20) NOT NULL DEFAULT 'DINHEIRO',
    cliente_id INTEGER NOT NULL REFERENCES core_cliente(id) ON DELETE RESTRICT,
    usuario_id INTEGER NOT NULL REFERENCES core_usuario(id) ON DELETE RESTRICT
);

-- 5. Criação da tabela de Itens da Venda (Relacionamento Produto <-> Venda)
CREATE TABLE core_itemvenda (
    id SERIAL PRIMARY KEY,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    valor_unitario NUMERIC(10, 2) NOT NULL,
    produto_id INTEGER NOT NULL REFERENCES core_produto(id) ON DELETE RESTRICT,
    venda_id INTEGER NOT NULL REFERENCES core_venda(id) ON DELETE CASCADE
);

-- 6. Criação da tabela de Configurações do Sistema (Opcional Extra)
CREATE TABLE core_configuracaoloja (
    id SERIAL PRIMARY KEY,
    nome_loja VARCHAR(255) NOT NULL DEFAULT 'AimSync SGC',
    cnpj VARCHAR(18) NULL,
    mensagem_rodape TEXT NULL,
    imposto_padrao NUMERIC(5, 2) NOT NULL DEFAULT 0.00
);
