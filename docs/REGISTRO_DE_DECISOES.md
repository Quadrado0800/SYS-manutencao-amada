# Registro de Decisões — Sistema de Gestão de Manutenção

> Documento de referência para registrar decisões arquiteturais, técnicas e de negócio. O objetivo é evitar perda de contexto entre os blocos, facilitar o trabalho em dupla e manter rastreáveis as decisões do projeto.
>
> **Regra:** decisões importantes só devem ser alteradas mediante nova decisão documentada. Informações ainda não definidas não devem ser inventadas.

## Status
- `APROVADA` — decisão definida e válida.
- `EM ANÁLISE` — alternativas sendo avaliadas.
- `PENDENTE` — ainda não há decisão.
- `REVISADA` — decisão anterior foi substituída.

---

# 1. Decisões Gerais

## DG-001 — Aplicação única
O sistema será uma única aplicação web multi-pousada para:
- Pousada Atlantic
- Flor de Magnólia
- Amada Terra

Não serão criadas três aplicações independentes.

**Status:** `APROVADA`

## DG-002 — Banco central
A aplicação utilizará um banco central contendo os dados das três pousadas.

**Status:** `APROVADA`

## DG-003 — Desenvolvimento modular em dupla
O projeto será desenvolvido em conjunto por duas pessoas, dividido em blocos independentes.

Cada bloco deve:
- possuir responsabilidade clara;
- minimizar dependências externas;
- documentar interfaces necessárias;
- informar arquivos criados/modificados;
- informar dependências;
- evitar modificar outros blocos sem necessidade;
- fornecer instruções de integração.

**Status:** `APROVADA`

## DG-004 — Arquitetura geral
Conceitualmente:

```text
Frontend
   ↓
REST API
   ↓
Backend Python
   ↓
Banco de dados
```

Arquivos enviados pelo sistema serão armazenados no filesystem do servidor; o banco armazenará referências e metadados.

**Status:** `APROVADA`

## DG-005 — Hospedagem inicial
A aplicação será inicialmente hospedada em um computador dentro da própria pousada e acessada pela rede interna.

**Status:** `APROVADA`

---

# 2. Stack

## ST-001 — Backend
- Python
- FastAPI
- SQLAlchemy

**Status:** `APROVADA`

## ST-002 — Banco inicial
Utilizar SQLite inicialmente.

**Status:** `APROVADA`

## ST-003 — Frontend
- HTML
- CSS
- JavaScript

**Status:** `APROVADA`

## ST-004 — Comunicação
Frontend e backend se comunicarão por REST API utilizando JSON.

**Status:** `APROVADA`

## ST-005 — Controle de versão
Utilizar Git.

**Status:** `APROVADA`

---

# 3. Multi-pousada e Espaços

## MP-001 — Estrutura física independente
O sistema não deve assumir que as três pousadas possuem a mesma estrutura física. Cada pousada poderá possuir seus próprios espaços.

**Status:** `APROVADA`

## MP-002 — Espaço genérico
"Espaço" será uma entidade genérica, capaz de representar ambientes como apartamento, recepção, restaurante, cozinha, piscina, corredor, elevador, escritório, chalé ou área externa.

**Status:** `APROVADA`

---

# 4. Entidades

## EN-001 — Entidades principais
- Pousada
- Usuário
- UsuárioPousada
- Espaço
- Manutenção
- Foto
- Auditoria

**Status:** `APROVADA`

## EN-002 — Pousada
Campos conceituais:

```text
id
nome
slug
ativa
criada_em
atualizada_em
```

Slugs:

```text
atlantic
flor-de-magnolia
amada-terra
```

**Status:** `APROVADA`

## EN-003 — Espaço
Campos conceituais:

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

O campo `tipo` deve ser genérico o suficiente para estruturas diferentes entre pousadas.

**Status:** `APROVADA`

## EN-004 — Manutenção
Campos conceituais:

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

Status iniciais:

```text
pendente
em_andamento
concluido
```

Tipos atualmente existentes no protótipo:

```text
pintura
eletrica
hidraulica
limpeza
mobiliario
ocorrencia
```

Categorias de custo:

```text
material
mao_de_obra
equipamento
outro
```

A estrutura acima é conceitual e poderá receber decisões de implementação no bloco de Banco de Dados.

**Status:** `APROVADA`

## EN-005 — Fotos
Uma manutenção poderá possuir várias fotos.

Os arquivos não serão armazenados como Base64 no banco. O filesystem armazenará os arquivos; o banco armazenará referências e metadados.

Campos conceituais:

```text
id
manutencao_id
nome_arquivo
caminho
tamanho
mime_type
criada_em
```

**Status:** `APROVADA`

## EN-006 — Auditoria
Operações importantes realizadas pelos usuários deverão ser registradas.

Campos conceituais:

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

Objetivo: identificar quem realizou uma alteração, quando e o que foi alterado.

**Status:** `APROVADA`

---

# 5. Usuários e Permissões

## US-001 — Papéis
Papéis iniciais:

```text
ADMIN
CHEFE
MANUTENCAO
```

**Status:** `APROVADA`

## US-002 — ADMIN
Pode:
- gerenciar usuários;
- gerenciar espaços;
- criar/editar/excluir manutenções;
- visualizar relatórios;
- visualizar auditoria;
- gerenciar configurações permitidas.

**Status:** `APROVADA`

## US-003 — CHEFE
Pode:
- visualizar informações;
- visualizar histórico;
- visualizar relatórios;
- visualizar custos.

Não pode modificar registros operacionais.

**Status:** `APROVADA`

## US-004 — MANUTENCAO
Pode:
- visualizar espaços;
- criar manutenções;
- editar manutenções;
- alterar status;
- adicionar fotos;
- consultar histórico.

**Status:** `APROVADA`

## US-005 — Autorização no backend
As permissões devem ser aplicadas no backend. O frontend não será responsável pela segurança real das operações.

**Status:** `APROVADA`

---

# 6. Segurança e Dados

## SG-001 — Senhas
Senhas não serão armazenadas em texto puro. Deverá ser utilizado mecanismo apropriado de hash.

Biblioteca/algoritmo específico: `PENDENTE`.

**Status:** `APROVADA`

## SG-002 — Regras de negócio
Regras importantes não devem existir somente no frontend. O backend deve validar e aplicar as regras relevantes.

**Status:** `APROVADA`

## SG-003 — Acesso ao banco
O frontend não terá acesso direto ao banco. Toda comunicação com os dados ocorrerá pela API.

**Status:** `APROVADA`

## VM-001 — Valores monetários
Não utilizar `float` para valores monetários.

Implementação específica: `PENDENTE`.

**Status:** `APROVADA`

---

# 7. API

## API-001 — Prefixo
Todas as rotas utilizarão o prefixo:

```text
/api
```

**Status:** `APROVADA`

## API-002 — Autenticação

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## API-003 — Pousadas

```text
GET    /api/pousadas
GET    /api/pousadas/{id}
POST   /api/pousadas
PUT    /api/pousadas/{id}
DELETE /api/pousadas/{id}
```

## API-004 — Espaços

```text
GET    /api/pousadas/{id}/espacos
POST   /api/pousadas/{id}/espacos
GET    /api/espacos/{id}
PUT    /api/espacos/{id}
DELETE /api/espacos/{id}
```

## API-005 — Manutenções

```text
GET    /api/pousadas/{id}/manutencoes
POST   /api/pousadas/{id}/manutencoes
GET    /api/manutencoes/{id}
PUT    /api/manutencoes/{id}
DELETE /api/manutencoes/{id}
```

## API-006 — Fotos

```text
POST   /api/manutencoes/{id}/fotos
GET    /api/manutencoes/{id}/fotos
DELETE /api/fotos/{id}
```

## API-007 — Dashboard

```text
GET /api/pousadas/{id}/dashboard
```

## API-008 — Relatórios

```text
GET /api/pousadas/{id}/relatorios/manutencoes
GET /api/pousadas/{id}/relatorios/custos
GET /api/pousadas/{id}/relatorios/pendencias
```

## API-009 — Auditoria

```text
GET /api/pousadas/{id}/auditoria
```

**Status dos contratos acima:** `APROVADA`

## API-010 — Contrato de respostas

Objeto:

```json
{
  "data": {}
}
```

Lista:

```json
{
  "data": [],
  "total": 0
}
```

Erro:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição do erro."
  }
}
```

Alterações no contrato da API devem ser documentadas.

**Status:** `APROVADA`

---

# 8. Regras Arquiteturais

## RA-001 — Responsabilidade dos módulos
Cada módulo deve possuir responsabilidade clara e evitar acoplamento desnecessário.

**Status:** `APROVADA`

## RA-002 — Não inventar requisitos
Quando uma informação necessária não estiver definida:
1. identificar a lacuna;
2. apresentar a necessidade de decisão;
3. propor alternativas quando apropriado;
4. decidir antes de implementar algo dependente dela.

**Status:** `APROVADA`

## RA-003 — Expansão futura
A arquitetura deve favorecer manutenção e expansão, sem introduzir complexidade desnecessária.

**Status:** `APROVADA`

---

# 9. Metodologia de Desenvolvimento

## MD-001 — Aprendizado como objetivo
O projeto possui dois objetivos:
1. desenvolver o sistema;
2. proporcionar aprendizado prático ao responsável pelo desenvolvimento.

A implementação deve favorecer compreensão dos conceitos, e não apenas produção rápida de código.

**Status:** `APROVADA`

## MD-002 — Desenvolvimento incremental
Funcionalidades devem ser desenvolvidas em etapas, permitindo compreender, implementar e testar cada parte antes de avançar.

**Status:** `APROVADA`

## MD-003 — Uso do DeepSeek
O DeepSeek será utilizado posteriormente como auxiliar técnico e segundo ponto de vista, após a conclusão da primeira fase dos blocos.

Suas sugestões serão analisadas criticamente e não serão consideradas decisões automáticas.

**Status:** `APROVADA`

---

# 10. Decisões Pendentes

Esta seção deve ser atualizada durante o desenvolvimento.

- mecanismo específico de autenticação/sessão;
- algoritmo e biblioteca para hash de senhas;
- estrutura definitiva dos relacionamentos no SQLAlchemy;
- estratégia de migrations;
- regras detalhadas de acesso de usuário a pousadas;
- comportamento de exclusão de registros;
- regras detalhadas de auditoria;
- convenção definitiva de nomes de tabelas/colunas;
- estrutura de diretórios para fotos;
- limites e validações de upload;
- estratégia de backup do SQLite;
- configuração de produção;
- detalhes de deploy na rede interna;
- testes automatizados;
- demais decisões identificadas pelos blocos.

> Os itens acima são pontos de definição, não decisões já tomadas.

---

# 11. Histórico

| Data | Alteração | Responsável |
|---|---|---|
| 17/09/2026 | Criação inicial do registro | Confort |

---

# 12. Regra Final

Antes de realizar uma alteração arquitetural relevante:

1. verificar se existe uma decisão registrada;
2. verificar se a alteração afeta outros blocos;
3. discutir a mudança;
4. registrar a nova decisão;
5. somente então implementar.

Decisões revisadas não devem simplesmente ser apagadas. O histórico deve permanecer rastreável.
