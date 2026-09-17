Você é responsável pelo BLOCO DE BACKEND/API do projeto "Sistema de Gestão de Manutenção".

Utilize o CONTRATO GERAL DO PROJETO abaixo.

[COLE AQUI O PROMPT GERAL]

==================================================
OBJETIVO
==================================================

Construir a API REST utilizando FastAPI.

A API deve consumir os models SQLAlchemy desenvolvidos no bloco de banco.

==================================================
RESPONSABILIDADES
==================================================

Implementar:

- inicialização FastAPI;
- routers;
- schemas Pydantic;
- validação;
- services;
- tratamento de erros;
- respostas padronizadas;
- CRUD de pousadas;
- CRUD de espaços;
- CRUD de manutenções;
- dashboard;
- relatórios.

==================================================
ENDPOINTS
==================================================

Utilizar exatamente os endpoints definidos no contrato geral.

Não alterar nomes ou métodos sem justificar.

==================================================
ARQUITETURA
==================================================

Separar:

Router
  ↓
Schema
  ↓
Service
  ↓
Model/Database

Evitar colocar toda a lógica de negócio diretamente dentro dos endpoints.

==================================================
MULTI-POUSADA
==================================================

Todo endpoint que manipular dados de uma pousada deve validar:

- existência da pousada;
- acesso do usuário à pousada;
- relação entre os objetos.

Nunca retornar dados de outra pousada por acidente.

==================================================
ENTREGÁVEIS
==================================================

Fornecer:

- estrutura de diretórios;
- código;
- schemas;
- routers;
- services;
- documentação dos endpoints;
- exemplos de requests/responses;
- instruções de integração com frontend.