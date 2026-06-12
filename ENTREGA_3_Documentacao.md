# AimSync - Entrega 3: Sistema Completo (Final)

---

## 1. Visão Geral
Esta é a documentação final do projeto **AimSync SGC**, contemplando todos os requisitos exigidos para a Entrega 3. O sistema foi totalmente integrado (Frontend + Backend), com regras de negócio validadas, design e identidade visual próprios, deploy preparado para a nuvem e sistema de segurança (recuperação e verificação de e-mails) operacionais.

---

## 2. Requisitos Atingidos (Critérios de Avaliação)

### 2.1 Integração (Interface + API) - 0,6
A interface de usuário construída puramente com HTML/CSS/JavaScript consome as rotas da API REST do Django perfeitamente. O fluxo de autenticação foi mantido com **JWT (JSON Web Tokens)**, guardados em `localStorage`. A aplicação agora funciona em sintonia, onde ações do usuário (como venda e cadastro) refletem em tempo real no banco de dados.

### 2.2 E-mail (Recuperação de Senha) - 0,5
O sistema possui a funcionalidade completa de **Recuperação de Senha por e-mail**. 
Foi configurado o suporte a envio real de e-mails usando SMTP (`django.core.mail.backends.smtp.EmailBackend`). O usuário informa o e-mail, o Django gera um token seguro temporário e dispara um e-mail. Clicar no link recebido o direciona para a tela com permissão de redefinição de senha. 
*Bônus: Foi adicionado um fluxo de Verificação de Conta por e-mail no ato do cadastro.*

### 2.3 Regras de Negócio - 0,5
Todas as regras vitais do comércio foram mantidas e reforçadas:
- Vendas abatem automaticamente do estoque num ambiente transacional (`transaction.atomic`).
- Não é possível apagar produtos ou clientes que já possuem histórico de vendas associado (chaves estrangeiras restritas).
- Preços e quantidades não aceitam valores negativos.

### 2.4 Funcionamento Geral - 0,5
O fluxo foi testado end-to-end. O usuário consegue se cadastrar, verificar o e-mail, logar, cadastrar clientes, cadastrar produtos, realizar uma venda através do Ponto de Venda (PDV) e visualizar essa venda batendo diretamente nos relatórios/dashboard.

### 2.5 Identidade Visual - 0,5
O sistema conta com logotipo próprio (AimSync) e uma paleta de cores consistente e moderna (escura/tecnológica com tons de Roxo e Preto). O CSS foi escrito do zero, garantindo responsividade e usabilidade.

### 2.6 Documentação Final e Entrega - 1,0
O repositório do projeto conta com os códigos-fonte organizados (separando backend e frontend). O arquivo `README.md` conta com instruções completas. Além disso, criamos o arquivo `CONFIGURACAO_VERCEL_SUPABASE.md` caso seja necessário rodar o sistema online em servidores Cloud reais.

---

## 3. Preparação para Nuvem (Vercel + Supabase)
O projeto também sofreu um *upgrade* arquitetural na Entrega 3. 
Em vez de depender do SQLite local, o Django foi configurado para utilizar o pacote `dj-database-url` e o motor do PostgreSQL (`psycopg2-binary`), permitindo a conexão em serviços como o Supabase. Adicionalmente, foi incluído o `whitenoise` e o arquivo `vercel.json` para hospedar todo o sistema na Vercel (Frontend e Backend Serverless juntos).
