Você é responsável pelo BLOCO DE DEPLOY E INFRAESTRUTURA.

Utilize o CONTRATO GERAL abaixo.

[COLE AQUI O PROMPT GERAL]

==================================================
CENÁRIO
==================================================

A aplicação será hospedada inicialmente em um computador dentro da própria pousada.

Os usuários acessarão a aplicação através da rede local.

Exemplo:

Servidor:
192.168.x.x

Aplicação:
FastAPI

Porta:
8000

==================================================
OBJETIVO
==================================================

Criar uma forma simples e confiável de executar a aplicação.

Preparar:

- configuração;
- variáveis de ambiente;
- banco;
- storage;
- inicialização;
- logs;
- backup;
- restart da aplicação.

==================================================
CONSIDERAR
==================================================

O sistema deve continuar funcionando sem internet, desde que a rede local esteja disponível.

Não assumir hospedagem pública.

==================================================
FUTURO

A solução deve permitir posteriormente:

- Docker;
- PostgreSQL;
- HTTPS;
- acesso externo controlado;

sem exigir reconstrução completa da aplicação.

==================================================
ENTREGÁVEIS
==================================================

- Dockerfile, se apropriado;
- docker-compose, se apropriado;
- .env.example;
- instruções de instalação;
- instruções de backup;
- instruções de atualização;
- instruções de recuperação.