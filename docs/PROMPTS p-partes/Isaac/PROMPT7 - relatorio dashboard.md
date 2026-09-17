Você é responsável pelo BLOCO DE RELATÓRIOS E DASHBOARD.

Utilize o CONTRATO GERAL abaixo.

[COLE AQUI O PROMPT GERAL]

==================================================
OBJETIVO
==================================================

Criar consultas e endpoints para transformar os registros de manutenção em informações úteis.

==================================================
DASHBOARD
==================================================

Implementar inicialmente:

- total de manutenções;
- pendentes;
- em andamento;
- concluídas;
- custo do período;
- custo anual;
- principais pendências.

Endpoint:

GET /api/pousadas/{id}/dashboard

==================================================
RELATÓRIOS
==================================================

Criar:

GET /api/pousadas/{id}/relatorios/manutencoes
GET /api/pousadas/{id}/relatorios/custos
GET /api/pousadas/{id}/relatorios/pendencias

Filtros possíveis:

- período;
- andar;
- espaço;
- tipo;
- status;
- responsável;
- categoria de custo.

==================================================
IMPORTANTE
==================================================

Todos os relatórios devem respeitar a pousada selecionada e as permissões do usuário.

Não implementar gráficos no frontend neste bloco.
Fornecer os dados necessários para o frontend.