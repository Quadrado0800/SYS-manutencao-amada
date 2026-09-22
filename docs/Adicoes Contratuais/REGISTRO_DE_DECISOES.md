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

OBS: A camada de Banco de Dados será mantida na pasta/bloco de Banco de Dados já existente no projeto, separada dos demais blocos do backend, evitando confusão entre responsabilidades.

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

## EN-003.5 — Usuário

Campos conceituais:

id
nome
email
senha_hash
ativo
criado_em
atualizado_em

A senha não será armazenada em texto puro. O campo `senha_hash` armazenará somente o resultado do mecanismo de hash definido pelo bloco responsável pela autenticação.

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
prioridade
data_registro
data_conclusao
valor
categoria_custo
criado_em
atualizado_em
```

`data_registro` representa a data em que a manutenção foi registrada no sistema.

`data_conclusao` representa a data em que a manutenção foi concluída e pode ser nula enquanto a manutenção não estiver concluída.

A data de registro não é sobrescrita quando a manutenção é concluída; ambas as informações devem ser preservadas.

`prioridade` aceita exclusivamente os valores:
- alta
- media
- baixa

Os valores acima são os valores oficiais de prioridade definidos no contrato da API.


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
**Status:** `APROVADA`

A estrutura acima é conceitual e poderá receber decisões de implementação no bloco de Banco de Dados.

Implementação: Os campos de status, tipo e categoria de custo serão implementados como String com restrições de integridade no banco, em vez de utilizar Enum rígido, mantendo flexibilidade para futura expansão dos valores.

**Status:** `APROVADA`

## EN-004.5 — Datas de manutenção

A manutenção possuirá duas datas de negócio distintas:

- `data_registro`: data em que a manutenção foi registrada;
- `data_conclusao`: data em que a manutenção foi concluída.

`data_conclusao` poderá ser nula enquanto a manutenção não estiver concluída.

A `data_registro` será preservada mesmo após a conclusão da manutenção.

Para a implementação inicial, essas duas datas serão representadas como `Date`, enquanto `criado_em` e `atualizado_em` serão timestamps (`DateTime`) técnicos do registro.

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

## EN-007 — Implementação do campo prioridade

O campo `prioridade` será armazenado como String no banco.

Os valores permitidos serão restringidos no banco aos valores:
- `alta`
- `media`
- `baixa`

A validação da requisição também será responsabilidade do backend/API, mas a camada de banco deverá possuir uma restrição de integridade para impedir valores diferentes dos definidos.

**Status:** `APROVADA`

## EN-008 — Integridade dos relacionamentos multi-pousada

O banco deverá preservar a consistência entre pousada, espaço e manutenção.

Uma manutenção não poderá ser associada a um espaço pertencente a outra pousada.

Da mesma forma, os vínculos de criação e responsabilidade da manutenção deverão respeitar a associação do usuário com a pousada correspondente.

A implementação deverá utilizar as constraints e relacionamentos apropriados do banco/SQLAlchemy para reforçar essa integridade.

**Status:** `APROVADA`

## EN-009 — Estratégia de integridade multi-pousada

A integridade dos relacionamentos entre pousada, espaço e usuários será garantida em duas camadas:

1. **Banco de Dados:** utilizar restrições de integridade, incluindo chaves estrangeiras compostas quando apropriado, para impedir associações entre entidades pertencentes a pousadas diferentes;
2. **Backend:** realizar validações das regras de negócio antes das operações de persistência, fornecendo respostas adequadas para a aplicação.

A camada de Banco de Dados será responsável pela integridade estrutural dos relacionamentos, enquanto o Backend também deverá validar essas regras antes de executar as operações.

A implementação deverá garantir, entre outros pontos:

- uma manutenção não poderá associar uma pousada a um espaço pertencente a outra pousada;
- o usuário que criou uma manutenção deverá possuir vínculo com a pousada da manutenção;
- o responsável por uma manutenção, quando informado, deverá possuir vínculo com a pousada da manutenção.

A implementação específica das chaves estrangeiras compostas, relacionamentos e demais restrições será definida no bloco de Banco de Dados antes da implementação.

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

## US-006 — Papel por pousada

Um usuário poderá estar vinculado a mais de uma pousada.

O papel do usuário será definido no vínculo `UsuárioPousada`, permitindo que o mesmo usuário possua papéis diferentes em pousadas diferentes.

Exemplo conceitual:

Usuário → Atlantic → MANUTENCAO
Usuário → Amada Terra → CHEFE

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

Implementação específica: `Numeric(12, 2)` no SQLAlchemy.

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

## RA-004 — Preservação de dados históricos

Dados operacionais e históricos não deverão ser apagados fisicamente de forma indiscriminada.

Quando aplicável, registros como pousadas, espaços e usuários deverão utilizar desativação lógica por meio de seus campos de estado (`ativa`/`ativo`), preservando o histórico.

Exclusões físicas em entidades dependentes deverão ser definidas conforme a natureza do dado e sem comprometer o histórico ou a auditoria.

**Status:** `APROVADA`

## RA-005 — Política de exclusão e preservação de dados

Dados cadastrais e históricos não serão fisicamente excluídos de forma indiscriminada.

Quando aplicável, entidades como pousadas, espaços e usuários deverão ser desativadas por meio de seus respectivos campos de controle de atividade.

Manutenções e registros de auditoria deverão ser preservados para manter o histórico do sistema.

Registros de fotos poderão ser excluídos quando uma foto não dever mais permanecer associada à manutenção. O tratamento do arquivo físico e sua remoção do armazenamento serão responsabilidade do bloco de Fotos/Storage, enquanto o Banco de Dados deverá permitir a remoção do respectivo registro de foto.

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
- ~~estrutura definitiva dos relacionamentos no SQLAlchemy;~~
- detalhes definitivos da implementação dos relacionamentos no SQLAlchemy e das restrições de integridade;
- estratégia de migrations;
- regras detalhadas de acesso de usuário a pousadas;
- ~~comportamento de exclusão de registros;~~
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
| 17/09/2026 | Definição de decisões de modelagem do bloco de Banco de Dados: prioridade, datas de manutenção, papel por pousada, estrutura mínima de usuário, valor monetário, integridade multi-pousada, preservação de histórico e organização da pasta do bloco | Confort |
| 21/09/2026 | Definição da estratégia de integridade multi-pousada: validação no Backend combinada com garantias de integridade no Banco de Dados, incluindo chaves estrangeiras compostas quando apropriado | Confort |
| 21/09/2026 | Definição da implementação da integridade multi-pousada: manutenção manterá as chaves estrangeiras simples e receberá chaves estrangeiras compostas adicionais para garantir a correspondência da pousada com espaço, criador e responsável | Confort |
| 22/09/2026 | Definição da política de exclusão e preservação de dados: desativação de cadastros, preservação de manutenções e auditorias e possibilidade de exclusão de registros de fotos, com o arquivo físico sob responsabilidade do bloco de Fotos/Storage | Confort |

---

# 12. Regra Final

Antes de realizar uma alteração arquitetural relevante:

1. verificar se existe uma decisão registrada;
2. verificar se a alteração afeta outros blocos;
3. discutir a mudança;
4. registrar a nova decisão;
5. somente então implementar.

Decisões revisadas não devem simplesmente ser apagadas. O histórico deve permanecer rastreável.
