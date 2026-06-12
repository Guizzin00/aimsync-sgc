# Guia de Deploy e Configuração (Vercel, Supabase e E-mail)

Este guia vai te ajudar a colocar o seu sistema **AimSync SGC** online, utilizando banco de dados na nuvem e servidor de e-mail real para recuperar senha e verificar contas.

---

## 1. Configurando o Servidor de E-mail (Gmail)

Para o sistema enviar e-mails de verdade (Recuperação de Senha e Verificação de Conta), você precisa de credenciais SMTP. Se você não tem um provedor de envio de e-mails corporativo (como SendGrid ou AWS SES), você pode usar o seu próprio Gmail.

### Passo a passo para o Gmail:
1. Acesse a sua [Conta do Google](https://myaccount.google.com/).
2. No menu à esquerda, clique em **Segurança**.
3. Na seção "Como você faz login no Google", certifique-se de que a **Verificação em duas etapas** está ativada.
4. Ainda em "Como você faz login no Google", clique em **Senhas de app** (ou procure por "Senhas de app" na barra de pesquisa da sua conta Google).
5. Selecione "Outro (nome personalizado)" ou digite um nome como `AimSync SGC`.
6. Clique em **Gerar**.
7. O Google vai te mostrar uma senha de 16 letras (ex: `abcd efgh ijkl mnop`). **Copie essa senha**, pois você não poderá vê-la novamente.

As variáveis que você precisará usar no Vercel serão:
- `EMAIL_HOST`: `smtp.gmail.com`
- `EMAIL_PORT`: `587`
- `EMAIL_USE_TLS`: `True`
- `EMAIL_HOST_USER`: `seu-email-real@gmail.com`
- `EMAIL_HOST_PASSWORD`: `senha_de_app_de_16_letras_aqui_sem_espacos`

---

## 2. Configurando o Banco de Dados (Supabase)

O Supabase oferece bancos de dados PostgreSQL gratuitos.

### Passo a passo:
1. Crie uma conta em [supabase.com](https://supabase.com/).
2. Clique em **New Project**, escolha uma organização e dê um nome (ex: `aimsync-db`).
3. Crie uma senha forte para o banco de dados (salve-a, você precisará dela!).
4. Aguarde o banco ser provisionado (pode levar alguns minutos).
5. No painel do projeto, vá em **Project Settings** (engrenagem) -> **Database**.
6. Role a página até a seção **Connection string** e clique na aba **URI**.
7. Copie a URL gerada, que deve ser parecida com:
   `postgresql://postgres.xxx:senha_aqui@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`
8. Substitua a palavra `[YOUR-PASSWORD]` pela senha forte que você criou no passo 3.

Essa URL completa será a sua variável de ambiente `DATABASE_URL`.

---

## 3. Fazendo o Deploy no Vercel

O Vercel vai hospedar tanto o código do Django quanto as telas do Frontend.

### Passo a passo:
1. Suba todo o seu projeto atualizado para o **GitHub**.
2. Crie uma conta no [Vercel](https://vercel.com/) e faça login com seu GitHub.
3. No Dashboard, clique em **Add New...** -> **Project**.
4. Importe o repositório do `aimsync-sgc` do seu GitHub.
5. Na tela de configuração ("Configure Project"), abra a aba **Environment Variables**.
6. Adicione as seguintes chaves e valores:
   - `DATABASE_URL`: *(a connection string do Supabase)*
   - `SECRET_KEY`: *(uma chave forte e aleatória para o Django, ex: `chave-secreta-aleatoria-123`)*
   - `EMAIL_HOST`: `smtp.gmail.com`
   - `EMAIL_PORT`: `587`
   - `EMAIL_USE_TLS`: `True`
   - `EMAIL_HOST_USER`: `seu-email-real@gmail.com`
   - `EMAIL_HOST_PASSWORD`: `(senha do app gerada no google)`
   - `FRONTEND_URL`: `https://seu-dominio-no-vercel.vercel.app` (Você pode configurar isso depois de dar o primeiro deploy e ver o domínio que o Vercel te deu).
7. Clique em **Deploy** e aguarde a conclusão.

### 4. Rodando as Migrações do Banco de Dados no Vercel
Como o Vercel não roda comandos dinâmicos no servidor facilmente (ambiente serverless), o melhor jeito de criar as tabelas no Supabase é rodar a migração *da sua máquina local* apontando para o banco remoto, OU usar a CLI do Vercel.

**Método mais fácil (via computador local):**
1. No seu computador, crie um arquivo `.env` na raiz do projeto (ou adicione as variáveis no seu Windows) contendo:
   `DATABASE_URL=postgresql://postgres.xxx:senha@host:6543/postgres`
2. No seu terminal local do projeto, rode:
   `python backend/manage.py migrate`
3. Isso vai criar todas as tabelas (clientes, produtos, usuários, etc.) diretamente no Supabase.

E pronto! O seu sistema completo, com backend, banco em nuvem e e-mails reais estará operando 100% online.
