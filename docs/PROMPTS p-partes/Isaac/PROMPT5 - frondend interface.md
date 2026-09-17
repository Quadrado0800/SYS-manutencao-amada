Você é responsável pelo BLOCO DE FRONTEND do projeto "Sistema de Gestão de Manutenção".

Utilize o CONTRATO GERAL abaixo.
-- ANEXAR HTML template

==================================================

Você está trabalhando no projeto "Sistema de Gestão de Manutenção", uma aplicação web interna para gerenciamento de manutenção de três pousadas:

1. Pousada Atlantic
2. Flor de Magnólia
3. Amada Terra

O projeto será desenvolvido em conjunto por duas pessoas, portanto toda solução deve favorecer desenvolvimento modular, trabalho paralelo e integração posterior.

==================================================
OBJETIVO
==================================================

Transformar um protótipo HTML/JavaScript existente em um sistema web funcional, centralizado e multi-pousada.

O sistema deverá permitir:

- autenticação de usuários;
- controle de permissões;
- seleção da pousada;
- gerenciamento dos espaços físicos;
- registro de manutenções;
- acompanhamento de status;
- registro de responsáveis;
- registro de custos;
- upload e visualização de fotos;
- histórico de manutenções;
- relatórios;
- dashboard;
- auditoria das alterações.

A aplicação será inicialmente hospedada em um computador dentro da própria pousada e acessada pela rede interna.

==================================================
STACK
==================================================

Backend:
- Python
- FastAPI
- SQLAlchemy
- SQLite inicialmente

Frontend:
- HTML
- CSS
- JavaScript

Comunicação:
- REST API
- JSON

Arquivos:
- armazenamento no filesystem do servidor
- banco guarda apenas referências aos arquivos

Controle de versão:
- Git

==================================================
ARQUITETURA
==================================================

A aplicação é MULTI-POUSADA.

Não devem existir três aplicações independentes.

Existe uma única aplicação e um banco central contendo dados das três pousadas.

Modelo conceitual:

Pousada
 ├── Usuários
 └── Espaços
       └── Manutenções
             └── Fotos

Auditoria registra alterações realizadas pelos usuários.

Todo dado operacional deve estar associado direta ou indiretamente a uma pousada.

==================================================
POUSADAS
==================================================

Pousadas existentes:

- Atlantic
- Flor de Magnólia
- Amada Terra

A estrutura física de cada pousada pode ser diferente.

O sistema NÃO deve assumir que todas possuem quartos, andares ou a mesma quantidade de espaços.

Um "Espaço" é uma entidade genérica.

Exemplos:

- Apt 101
- Recepção
- Restaurante
- Cozinha
- Piscina
- Corredor
- Elevador
- Escritório
- Chalé
- Área externa

Cada pousada deverá poder possuir seus próprios espaços.

==================================================
ENTIDADES PRINCIPAIS
==================================================

Pousada
Usuário
UsuárioPousada
Espaço
Manutenção
Foto
Auditoria

==================================================
USUÁRIOS
==================================================

Papéis inicialmente existentes:

ADMIN
CHEFE
MANUTENCAO

ADMIN:
- acesso administrativo;
- gerenciar usuários;
- gerenciar espaços;
- criar/editar/excluir manutenções;
- visualizar relatórios;
- visualizar auditoria;
- gerenciar configurações permitidas.

CHEFE:
- visualizar informações;
- visualizar histórico;
- visualizar relatórios;
- visualizar custos;
- não pode modificar registros operacionais.

MANUTENCAO:
- visualizar espaços;
- criar manutenções;
- editar manutenções;
- alterar status;
- adicionar fotos;
- consultar histórico.

As permissões devem ser aplicadas no BACKEND.
O frontend não deve ser responsável por segurança.

==================================================
ENTIDADE POUSADA
==================================================

Campos conceituais:

id
nome
slug
ativa
criada_em
atualizada_em

Slugs:

atlantic
flor-de-magnolia
amada-terra

==================================================
ENTIDADE ESPAÇO
==================================================

Campos conceituais:

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

"tipo" deve ser suficientemente genérico para permitir diferentes estruturas.

==================================================
ENTIDADE MANUTENÇÃO
==================================================

Campos conceituais:

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

Status iniciais:

pendente
em_andamento
concluido

Tipos atualmente existentes no protótipo:

pintura
eletrica
hidraulica
limpeza
mobiliario
ocorrencia

Categorias de custo:

material
mao_de_obra
equipamento
outro

==================================================
FOTOS
==================================================

Uma manutenção pode possuir várias fotos.

Os arquivos não devem ser armazenados como Base64 no banco.

O banco deve guardar metadados/referências.

Exemplo:

Foto
- id
- manutencao_id
- nome_arquivo
- caminho
- tamanho
- mime_type
- criada_em

==================================================
AUDITORIA
==================================================

Registrar operações importantes.

Exemplo:

Auditoria
- id
- pousada_id
- usuario_id
- entidade
- entidade_id
- acao
- dados_anteriores
- dados_novos
- criado_em

Objetivo:
permitir descobrir quem realizou uma alteração, quando e o que foi alterado.

==================================================
API
==================================================

Prefixo:

/api

Autenticação:

POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me

Pousadas:

GET /api/pousadas
GET /api/pousadas/{id}
POST /api/pousadas
PUT /api/pousadas/{id}
DELETE /api/pousadas/{id}

Espaços:

GET /api/pousadas/{id}/espacos
POST /api/pousadas/{id}/espacos
GET /api/espacos/{id}
PUT /api/espacos/{id}
DELETE /api/espacos/{id}

Manutenções:

GET /api/pousadas/{id}/manutencoes
POST /api/pousadas/{id}/manutencoes
GET /api/manutencoes/{id}
PUT /api/manutencoes/{id}
DELETE /api/manutencoes/{id}

Fotos:

POST /api/manutencoes/{id}/fotos
GET /api/manutencoes/{id}/fotos
DELETE /api/fotos/{id}

Dashboard:

GET /api/pousadas/{id}/dashboard

Relatórios:

GET /api/pousadas/{id}/relatorios/manutencoes
GET /api/pousadas/{id}/relatorios/custos
GET /api/pousadas/{id}/relatorios/pendencias

Auditoria:

GET /api/pousadas/{id}/auditoria

==================================================
CONTRATO API
==================================================

Resposta de objeto:

{
    "data": {...}
}

Resposta de lista:

{
    "data": [...],
    "total": 0
}

Erro:

{
    "error": {
        "code": "ERROR_CODE",
        "message": "Descrição do erro."
    }
}

==================================================
REGRAS IMPORTANTES
==================================================

1. Não criar três sistemas independentes.

2. Não colocar regras de negócio importantes apenas no frontend.

3. Não armazenar senhas em texto puro.

4. Não armazenar fotos como Base64 no banco.

5. Não utilizar float para valores monetários.

6. Não assumir que as três pousadas possuem a mesma estrutura.

7. Não modificar contratos da API sem documentar a alteração.

8. Não acoplar frontend diretamente ao banco.

9. Cada módulo deve possuir responsabilidade clara.

10. O código deve favorecer manutenção e futura expansão.

==================================================
FORMA DE TRABALHO
==================================================

O projeto será dividido em blocos independentes.

Cada bloco deve:

- possuir responsabilidade claramente definida;
- minimizar dependências externas;
- documentar interfaces necessárias;
- informar arquivos criados/modificados;
- informar dependências;
- evitar modificar outros blocos sem necessidade;
- fornecer instruções de integração.

Quando uma informação necessária não estiver definida, NÃO invente.
Identifique a lacuna e proponha uma decisão antes de implementá-la.

O objetivo não é simplesmente gerar código rapidamente.
O objetivo é construir uma aplicação organizada que duas pessoas consigam desenvolver e manter em conjunto.

==================================================

Também será fornecido um arquivo HTML que representa o protótipo atual do sistema.

IMPORTANTE:
O HTML fornecido é uma referência funcional e visual.
Analise sua estrutura antes de modificar qualquer coisa.

==================================================
OBJETIVO
==================================================

Transformar o protótipo atual em um frontend funcional conectado à API FastAPI.

==================================================
PRESERVAR
==================================================

Sempre que possível preservar:

- identidade visual;
- layout;
- fluxo de navegação;
- componentes existentes;
- nomes compreensíveis;
- funcionalidades já existentes.

Não reconstruir a interface do zero sem necessidade.

==================================================
ALTERAÇÃO PRINCIPAL
==================================================

Atualmente o protótipo utiliza localStorage.

Isso deve ser removido gradualmente.

Fluxo antigo:

HTML
 ↓
JavaScript
 ↓
localStorage

Fluxo novo:

HTML
 ↓
JavaScript
 ↓
fetch()
 ↓
FastAPI
 ↓
Banco

==================================================
FUNCIONALIDADES
==================================================

Implementar/integrar:

- login;
- seleção de pousada;
- espaços;
- manutenção;
- status;
- responsáveis;
- custos;
- fotos;
- histórico;
- relatórios;
- dashboard;
- logout.

==================================================
MULTI-POUSADA
==================================================

A interface não deve assumir Atlantic como pousada fixa.

O sistema deve obter as pousadas através da API.

Depois do login:

usuário
 ↓
pousadas disponíveis
 ↓
seleção
 ↓
dados daquela pousada

==================================================
ENTREGÁVEIS
==================================================

Fornecer:

- arquivos HTML;
- CSS;
- JavaScript;
- organização dos arquivos;
- API client;
- tratamento de loading;
- tratamento de erros;
- integração com os endpoints.

Indicar claramente quais partes do HTML original precisam ser alteradas.