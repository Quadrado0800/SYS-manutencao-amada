# Contrato do Projeto — Sistema de Gestão de Manutenção

**Versão:** 1.0
**Status:** Documento base do projeto

---

## 1. Objetivo

Este projeto consiste em um sistema web interno para gerenciamento de manutenção de pousadas.

O sistema deverá centralizar o registro, acompanhamento, consulta e análise das manutenções realizadas nas pousadas atendidas.

A aplicação será inicialmente hospedada em um computador dentro da estrutura da pousada e deverá ser acessível através da rede local.

O mesmo sistema deverá atender inicialmente três pousadas:

* Pousada Atlantic
* Flor de Magnólia
* Amada Terra

A aplicação deverá ser construída como **um único sistema multi-pousada**, e não como três aplicações independentes.

---

## 2. Princípios fundamentais

As seguintes regras são obrigatórias durante o desenvolvimento:

1. O sistema deve ser multi-pousada desde sua concepção.
2. Os dados de uma pousada não podem ser acessados ou alterados indevidamente por usuários de outra pousada.
3. As regras importantes do sistema devem ser aplicadas no backend, e não somente no frontend.
4. O frontend não deve acessar o banco de dados diretamente.
5. A comunicação entre frontend e backend deverá ocorrer através da API.
6. Senhas nunca devem ser armazenadas em texto puro.
7. Fotos não devem ser armazenadas como Base64 dentro do banco de dados.
8. Valores monetários não devem utilizar `float`.
9. As estruturas das três pousadas não devem ser consideradas necessariamente idênticas.
10. Alterações em contratos entre módulos devem ser documentadas.
11. Cada módulo deve possuir responsabilidade clara.
12. O projeto deve permanecer preparado para expansão futura.

---

# 3. Stack tecnológica

## Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite inicialmente
* Pydantic

## Frontend

* HTML
* CSS
* JavaScript
* `fetch()` para comunicação com a API

## Persistência de arquivos

Fotos e outros arquivos enviados pelo sistema deverão ser armazenados no filesystem do servidor.

O banco deverá armazenar somente os metadados e referências necessárias aos arquivos.

---

# 4. Arquitetura geral

O fluxo principal da aplicação deverá seguir:

```text
Usuário
   │
   ▼
Frontend
HTML / CSS / JavaScript
   │
   │ HTTP / JSON
   ▼
FastAPI
   │
   ├── Autenticação
   ├── Permissões
   ├── Validação
   ├── Regras de negócio
   ├── Relatórios
   └── Auditoria
   │
   ▼
Services
   │
   ▼
SQLAlchemy
   │
   ▼
Banco de dados
```

Arquivos enviados:

```text
Frontend
   │
   ▼
FastAPI
   │
   ▼
Serviço de arquivos
   │
   ▼
Filesystem
```

---

# 5. Multi-pousada

O sistema deverá possuir uma entidade central de pousada.

Pousadas iniciais:

| Nome             | Slug               |
| ---------------- | ------------------ |
| Pousada Atlantic | `atlantic`         |
| Flor de Magnólia | `flor-de-magnolia` |
| Amada Terra      | `amada-terra`      |

O `slug` deverá ser estável e utilizado quando necessário para identificar a pousada em URLs, configurações ou outras partes do sistema.

Cada informação operacional deverá possuir relação com uma pousada quando aplicável.

Exemplo:

```text
Pousada
   │
   ├── Espaços
   │
   ├── Manutenções
   │
   ├── Usuários autorizados
   │
   └── Auditoria
```

Um usuário poderá possuir acesso a uma ou mais pousadas.

---

# 6. Entidades principais

O sistema deverá trabalhar inicialmente com as seguintes entidades:

```text
Pousada
Usuário
UsuárioPousada
Espaço
Manutenção
Foto
Auditoria
```

---

## 6.1 Pousada

Representa uma unidade hoteleira atendida pelo sistema.

Campos previstos:

```text
id
nome
slug
ativa
criada_em
atualizada_em
```

---

## 6.2 Usuário

Representa uma pessoa que utiliza o sistema.

Campos previstos:

```text
id
nome
username
password_hash
ativo
criado_em
atualizado_em
```

A senha original nunca deverá ser armazenada.

---

## 6.3 UsuárioPousada

Relaciona usuários às pousadas às quais eles possuem acesso.

Campos previstos:

```text
id
usuario_id
pousada_id
```

Essa relação deverá permitir que um usuário tenha acesso a mais de uma pousada.

---

## 6.4 Espaço

Representa uma área física onde uma manutenção pode ocorrer.

Exemplos:

```text
Apartamento 101
Apartamento 102
Recepção
Restaurante
Cozinha
Banheiro
Corredor
```

Campos previstos:

```text
id
pousada_id
nome
identificador
tipo
andar
ordem
ativo
criado_em
atualizado_em
```

A estrutura dos espaços deverá ser configurável por pousada.

Não deverá existir uma regra que obrigue todas as pousadas a possuírem os mesmos espaços.

---

## 6.5 Manutenção

Representa um registro de manutenção.

Campos previstos:

```text
id
pousada_id
espaco_id
criado_por_id
responsavel_id
tipo
descricao
status
data
valor
categoria_custo
criado_em
atualizado_em
```

Tipos inicialmente previstos:

```text
pintura
eletrica
hidraulica
limpeza
mobiliario
ocorrencia
```

Status inicialmente previstos:

```text
pendente
em_andamento
concluido
```

Categorias de custo inicialmente previstas:

```text
material
mao_de_obra
equipamento
outro
```

Esses valores deverão permanecer centralizados no backend para evitar divergências entre frontend e backend.

---

## 6.6 Foto

Representa uma foto associada a uma manutenção.

Campos previstos:

```text
id
manutencao_id
nome_arquivo
caminho
tamanho
mime_type
criada_em
```

O banco deverá armazenar a referência ao arquivo, e não seu conteúdo em Base64.

---

## 6.7 Auditoria

Representa o histórico de ações relevantes realizadas no sistema.

Campos previstos:

```text
id
pousada_id
usuario_id
entidade
entidade_id
acao
dados_anteriores
dados_novos
criado_em
```

A auditoria deverá ser gerada pelo backend.

---

# 7. Papéis de usuário

O sistema deverá possuir inicialmente três papéis:

```text
ADMIN
CHEFE
MANUTENCAO
```

A definição detalhada das permissões ficará documentada no módulo de autenticação.

Como princípio geral:

* `ADMIN`: administração do sistema e acesso às funções administrativas permitidas.
* `CHEFE`: consulta, acompanhamento e funções gerenciais permitidas.
* `MANUTENCAO`: execução e atualização das atividades de manutenção permitidas.

O frontend não deverá ser considerado a autoridade final sobre permissões.

O backend deverá validar as permissões de cada operação.

---

# 8. API

A API deverá utilizar o prefixo:

```text
/api
```

Endpoints principais previstos:

## Autenticação

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Pousadas

```http
GET    /api/pousadas
POST   /api/pousadas
GET    /api/pousadas/{id}
PUT    /api/pousadas/{id}
DELETE /api/pousadas/{id}
```

## Espaços

```http
GET    /api/pousadas/{id}/espacos
POST   /api/pousadas/{id}/espacos
GET    /api/espacos/{id}
PUT    /api/espacos/{id}
DELETE /api/espacos/{id}
```

## Manutenções

```http
GET    /api/pousadas/{id}/manutencoes
POST   /api/pousadas/{id}/manutencoes
GET    /api/manutencoes/{id}
PUT    /api/manutencoes/{id}
DELETE /api/manutencoes/{id}
```

## Fotos

```http
POST   /api/manutencoes/{id}/fotos
GET    /api/manutencoes/{id}/fotos
DELETE /api/fotos/{id}
```

## Dashboard

```http
GET /api/pousadas/{id}/dashboard
```

## Relatórios

```http
GET /api/pousadas/{id}/relatorios/manutencoes
GET /api/pousadas/{id}/relatorios/custos
GET /api/pousadas/{id}/relatorios/pendencias
```

## Auditoria

```http
GET /api/pousadas/{id}/auditoria
```

Essa lista representa o contrato inicial.

Novos endpoints podem ser adicionados conforme necessidade, mas alterações que afetem módulos existentes deverão ser documentadas.

---

# 9. Formato das respostas da API

Respostas contendo um objeto deverão seguir:

```json
{
  "data": {}
}
```

Respostas contendo uma lista deverão seguir:

```json
{
  "data": [],
  "total": 0
}
```

Erros deverão seguir:

```json
{
  "error": {
    "code": "CODIGO_DO_ERRO",
    "message": "Descrição do erro"
  }
}
```

Os códigos de erro deverão ser consistentes entre endpoints.

---

# 10. Regras de segurança

## Senhas

Nunca armazenar:

```text
senha123
admin123
qualquer senha em texto puro
```

Deverá ser armazenado somente um hash seguro.

---

## Isolamento entre pousadas

Toda operação deverá verificar se o usuário possui autorização para acessar a pousada envolvida.

Não será suficiente verificar apenas no frontend.

Exemplo:

```text
Usuário A
   │
   ├── Atlantic       ✓
   ├── Flor Magnólia  ✓
   └── Amada Terra   ✗
```

Uma requisição tentando acessar dados da Amada Terra deverá ser recusada pelo backend.

---

## Uploads

Arquivos enviados deverão:

* possuir tipos permitidos;
* possuir limite de tamanho;
* receber nomes seguros;
* evitar colisões;
* impedir path traversal;
* ser associados à pousada/manutenção correta.

---

# 11. Dinheiro

Valores monetários deverão utilizar um tipo apropriado para precisão decimal.

Não utilizar:

```python
float
```

para representar valores monetários.

A implementação deverá utilizar `Decimal`/`Numeric` ou equivalente apropriado.

---

# 12. Fotos e arquivos

Fotos não deverão ser convertidas para:

```text
Base64
```

para serem armazenadas no banco.

Estrutura inicial prevista:

```text
storage/
└── uploads/
    ├── atlantic/
    ├── flor-de-magnolia/
    └── amada-terra/
```

A implementação poderá criar subdiretórios adicionais para organização.

---

# 13. Frontend

O frontend deverá consumir exclusivamente a API para dados persistentes.

Não deverá existir uma implementação definitiva baseada em:

```javascript
localStorage
```

para substituir o banco de dados.

O template HTML existente será utilizado como base visual e funcional.

Durante a migração, deverá ser preservada a maior quantidade possível da interface e dos fluxos existentes, evitando reescritas desnecessárias.

---

# 14. Template existente

O projeto possui atualmente o arquivo:

```text
pousada_atlantic_manutencao_template_2.html
```

Esse arquivo representa o protótipo inicial da aplicação.

O template possui funcionalidades que deverão ser analisadas durante a migração, incluindo:

* login;
* espaços;
* registros de manutenção;
* status;
* responsáveis;
* custos;
* categorias de custo;
* fotos;
* filtros;
* relatórios;
* dados iniciais;
* permissões de interface;
* persistência em `localStorage`.

A implementação definitiva não deverá simplesmente copiar a persistência do protótipo.

O fluxo deverá ser transformado em:

```text
HTML/JS
   ↓
API FastAPI
   ↓
Services
   ↓
SQLAlchemy
   ↓
Banco
```

---

# 15. Dados iniciais

As três pousadas deverão possuir seus próprios dados de configuração.

A estrutura da Pousada Atlantic atualmente existente no protótipo deverá ser considerada uma fonte de referência para a migração.

As estruturas de Flor de Magnólia e Amada Terra deverão ser configuráveis.

Não se deve copiar automaticamente a estrutura da Atlantic para as outras pousadas sem confirmação.

---

# 16. Auditoria

Operações relevantes deverão poder ser rastreadas.

Exemplos:

```text
criação de manutenção
alteração de manutenção
mudança de status
exclusão de manutenção
criação de espaço
alteração de espaço
exclusão de espaço
ações administrativas
```

O registro deverá identificar, quando aplicável:

```text
quem realizou
qual pousada
qual entidade
qual registro
qual ação
quando ocorreu
dados anteriores
dados novos
```

---

# 17. Relatórios e dashboard

O sistema deverá permitir consultar informações como:

* quantidade de manutenções;
* manutenções pendentes;
* manutenções em andamento;
* manutenções concluídas;
* custos;
* distribuição por categoria;
* distribuição por tipo;
* manutenções por espaço;
* manutenções por período;
* responsável.

Os relatórios deverão respeitar as permissões do usuário e o isolamento entre pousadas.

Os cálculos deverão ser realizados com base nos dados do backend.

---

# 18. Responsabilidade dos módulos

Cada bloco do projeto deverá possuir uma responsabilidade definida.

```text
Banco de dados
→ Persistência e relacionamentos

Backend/API
→ Regras de negócio e comunicação

Autenticação
→ Identidade, sessão e permissões

Frontend
→ Interface e experiência de utilização

Fotos
→ Upload e armazenamento de arquivos

Relatórios
→ Consultas e agregações

Auditoria
→ Histórico das operações

Testes
→ Validação automática do sistema

Deploy
→ Execução e manutenção da aplicação

Migração
→ Transformação do protótipo atual para a nova arquitetura
```

Um módulo não deverá assumir responsabilidades que pertencem a outro sem necessidade.

---

# 19. Contratos entre módulos

Os módulos deverão se comunicar através de interfaces claras.

Por exemplo:

```text
Frontend
    ↓
Contrato da API
    ↓
Backend
    ↓
Contrato dos Services
    ↓
Banco
```

Se um módulo precisar alterar uma estrutura utilizada por outro módulo, a alteração deverá ser documentada antes da integração.

Não deverão ser feitas alterações silenciosas que quebrem outros componentes.

---

# 20. Regras para desenvolvimento paralelo

O projeto poderá ser desenvolvido simultaneamente por diferentes pessoas ou agentes.

Cada bloco deverá:

1. compreender este contrato;
2. respeitar as entidades existentes;
3. documentar suas dependências;
4. documentar os arquivos criados ou alterados;
5. informar contratos que outros blocos precisam utilizar;
6. evitar alterar funcionalidades pertencentes a outro bloco;
7. identificar informações ausentes em vez de inventar regras;
8. preservar compatibilidade sempre que possível.

---

# 21. Git e integração

O desenvolvimento deverá utilizar Git.

Exemplo de organização:

```text
main
│
├── feature/backend-database
├── feature/backend-auth
├── feature/backend-api
├── feature/frontend-layout
├── feature/frontend-api
├── feature/frontend-reports
├── feature/photos
└── feature/tests
```

A branch `main` deverá permanecer estável.

Cada bloco deverá ser desenvolvido em uma branch própria quando fizer sentido.

---

# 22. Evolução futura

A implementação inicial utilizará SQLite por simplicidade e por ser adequada ao ambiente inicial.

A arquitetura deverá evitar dependências que tornem a migração para PostgreSQL desnecessariamente difícil.

Possíveis evoluções futuras:

```text
SQLite
   ↓
PostgreSQL

Rede local
   ↓
Acesso externo controlado

Servidor único
   ↓
Infraestrutura dedicada

Armazenamento local
   ↓
Storage externo

Sistema de manutenção
   ↓
Outros módulos de gestão hoteleira
```

Essas possibilidades não fazem parte da primeira versão, mas não devem ser inviabilizadas pela arquitetura atual.

---

# 23. Regra de ouro

O sistema deverá ser tratado como uma aplicação real de produção, mesmo durante o desenvolvimento inicial.

Isso significa:

* regras importantes no backend;
* dados persistentes no banco;
* autenticação real;
* permissões reais;
* isolamento entre pousadas;
* armazenamento adequado de arquivos;
* auditoria;
* testes;
* backups;
* documentação;
* código modular.

O protótipo HTML é uma referência de interface e funcionalidades existentes, não a arquitetura definitiva do sistema.

---

# 24. Status deste documento

Este documento representa o **contrato base do projeto**.

Quando uma decisão técnica ou funcional futura entrar em conflito com este documento, deverá ser feita uma revisão explícita do contrato.

Alterações importantes deverão atualizar a versão do documento e, quando necessário, os documentos específicos relacionados.

**Versão atual: 1.0**
