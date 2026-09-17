Você é responsável exclusivamente pelo sistema de AUTENTICAÇÃO E AUTORIZAÇÃO do projeto.

Utilize o CONTRATO GERAL abaixo.

[COLE AQUI O PROMPT GERAL]

==================================================
OBJETIVO
==================================================

Substituir completamente a autenticação atualmente existente no HTML por autenticação real no backend.

O protótipo atual possui usuários e senhas diretamente no JavaScript.
Isso NÃO deve ser mantido.

==================================================
IMPLEMENTAR
==================================================

- login;
- logout;
- identificação do usuário atual;
- senha com hash seguro;
- sessão/autenticação;
- proteção de endpoints;
- roles;
- permissões;
- relação usuário ↔ pousada.

Papéis:

ADMIN
CHEFE
MANUTENCAO

==================================================
MULTI-POUSADA
==================================================

Um usuário poderá possuir acesso a uma ou mais pousadas.

Exemplo:

Usuário A:
Atlantic

Usuário B:
Atlantic
Amada Terra

Usuário C:
Flor de Magnólia

O backend deve validar o acesso à pousada em cada operação.

==================================================
PERMISSÕES
==================================================

ADMIN:
acesso administrativo completo.

CHEFE:
visualização e relatórios.

MANUTENCAO:
operações de manutenção permitidas.

As permissões devem ser verificadas no backend.

==================================================
ENTREGÁVEIS
==================================================

- código;
- dependências;
- fluxo de autenticação;
- dependências FastAPI necessárias;
- exemplos;
- instruções para integração com os routers;
- instruções para o frontend consumir login/me/logout.

Não implementar a interface visual do login.