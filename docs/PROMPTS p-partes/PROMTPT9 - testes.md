Você é responsável pelo BLOCO DE TESTES do projeto.

Utilize o CONTRATO GERAL abaixo.

[COLE AQUI O PROMPT GERAL]

==================================================
OBJETIVO
==================================================

Criar testes automatizados para garantir que os módulos possam ser integrados sem regressões.

==================================================
TESTAR
==================================================

Banco:
- criação;
- relacionamentos;
- constraints.

Autenticação:
- login válido;
- login inválido;
- usuário inativo;
- permissões.

Multi-pousada:
- usuário acessando pousada permitida;
- usuário tentando acessar pousada não permitida;
- isolamento de dados.

Manutenções:
- criação;
- edição;
- exclusão;
- status;
- custos.

Fotos:
- upload;
- validação;
- exclusão.

Relatórios:
- filtros;
- totais;
- isolamento por pousada.

==================================================
IMPORTANTE
==================================================

Os testes devem poder rodar independentemente em ambiente de desenvolvimento.

Não utilizar o banco real de produção.