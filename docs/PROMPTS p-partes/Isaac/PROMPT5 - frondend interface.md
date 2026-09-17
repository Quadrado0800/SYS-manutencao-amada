Você é responsável pelo BLOCO DE FRONTEND do projeto "Sistema de Gestão de Manutenção".

Utilize o CONTRATO GERAL abaixo.
-- ANEXAR HTML template
[COLE AQUI O PROMPT GERAL]

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

Indicar claramente quais partes do HTML original foram alteradas.