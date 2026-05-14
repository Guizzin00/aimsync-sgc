# AimSync - Entrega 2: Backend e Integração (13/05)

---

## 1. Visão Geral da Entrega

A Entrega 2 tem como foco o desenvolvimento do backend e a sua integração com a interface de usuário. Foram implementadas a API RESTful e a persistência de dados no banco, além da comunicação entre a API e as telas do sistema. O projeto seguiu o padrão de arquitetura em camadas e priorizou a separação de responsabilidades.

---

## 2. Funcionalidades Implementadas

O projeto atende aos requisitos estabelecidos com as seguintes funcionalidades operacionais:

- **Banco Integrado**: Persistência de dados configurada utilizando o ORM do Django com SQLite. Foram mapeados os modelos de Cliente, Produto, Venda e Usuário, incluindo relacionamentos (Foreign Keys) e restrições.
- **CRUD de Clientes e Produtos**: Endpoints completos (`GET`, `POST`, `PUT`, `DELETE`) operando via `ViewSets`. Foi incluído o suporte ao upload de imagens para os produtos.
- **Registro de Vendas**: O Ponto de Venda (PDV) foi conectado à API. O processamento da venda ocorre em uma transação atômica (`transaction.atomic`) para garantir a consistência dos dados.
- **Controle de Estoque**: A redução do estoque é calculada e efetivada no banco de dados automaticamente durante o registro de cada venda, com validação de saldo disponível.
- **Relatórios de Vendas**: Endpoint `/api/relatorios/vendas/` criado para retornar dados agregados, que alimentam os gráficos (`Chart.js`) presentes na tela de Dashboard.
- **Autenticação e Segurança**: Login implementado com tokens JWT. Adicionado também o fluxo de redefinição de senha via API.
- **Testes Básicos**: O fluxo principal do sistema foi validado, cobrindo o cadastro de clientes e produtos, o registro de uma venda, a baixa no estoque e a atualização do relatório financeiro.

---

## 3. Avaliação Técnica (Critérios da Entrega)

As soluções adotadas para cada critério de avaliação são descritas a seguir:

### 3.1 Integração com banco de dados (Persistência Funcional)
A persistência é gerenciada pelo ORM do Django. Os relacionamentos entre Vendas, Clientes e Produtos utilizam regras de restrição (`on_delete=models.RESTRICT`) para evitar inconsistências, como a exclusão de um produto que já possui histórico de vendas.

### 3.2 Navegabilidade das Telas (Conexão Lógica e Funcional)
A interface HTML consome os endpoints do backend utilizando requisições assíncronas (`fetch API`). As telas (Login, Dashboard, Clientes, Produtos e PDV) mantêm a sessão através do armazenamento de tokens no `localStorage`. Mensagens de validação e sucesso são exibidas utilizando a biblioteca SweetAlert2.

### 3.3 Tratamento de Exceções
Foi configurado um manipulador global de exceções no Django REST Framework (`core.exceptions.custom_exception_handler`). Em casos de erros de regra de negócio (como estoque insuficiente ou CPF já cadastrado), o backend intercepta o erro e retorna um objeto JSON padronizado com o código HTTP 400. O frontend lê essa resposta e exibe o alerta correspondente.

### 3.4 Organização e Legibilidade do Código
- **Estrutura:** O código está dividido entre o diretório `backend` (Django) e `frontend` (HTML/CSS/JS). No backend, a estrutura segue a divisão padrão em `models.py`, `views.py`, `serializers.py` e `urls.py`.
- **Nomenclatura e Limpeza:** As rotas foram otimizadas utilizando `DefaultRouter` e as variáveis/métodos seguem nomenclatura descritiva em português para representar as regras de negócio (`valor_total`, `calcularTotal()`).

### 3.5 Versionamento no GitHub
O repositório contém o histórico de commits do projeto. As atualizações de interface, correções de API e novas funcionalidades foram separadas em commits graduais para manter a rastreabilidade do desenvolvimento.

---

## 4. Principais Alterações desde a Entrega 1

1. **Desenvolvimento do Frontend**: As telas conceituais da Entrega 1 foram programadas em HTML, CSS e JavaScript puro.
2. **Implementação da API**: Os diagramas de classe e casos de uso foram convertidos em endpoints reais. Um arquivo central (`api.js`) foi criado no frontend para gerenciar as chamadas HTTP e enviar o cabeçalho de autorização (Bearer token).
3. **Melhoria no PDV**: A interface do Ponto de Venda foi refatorada. A seleção da forma de pagamento foi movida para um modal isolado.
4. **Suporte a Imagens**: Adicionada a capacidade de salvar e servir imagens cadastradas para os produtos no banco de dados.
5. **Recuperação de Acesso**: Adicionado fluxo de "Esqueci a Senha" adaptado para funcionar via API REST, sem renderização de templates no lado do servidor.
