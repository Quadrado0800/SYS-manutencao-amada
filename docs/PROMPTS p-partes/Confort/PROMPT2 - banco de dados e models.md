Você é responsável exclusivamente pelo BLOCO DE BANCO DE DADOS do projeto "Sistema de Gestão de Manutenção".

Utilize o CONTRATO GERAL DO PROJETO fornecido abaixo como especificação.

[COLE AQUI O PROMPT GERAL]

==================================================
OBJETIVO DESTE BLOCO
==================================================

Construir a camada de persistência da aplicação utilizando:

- SQLAlchemy
- SQLite inicialmente

Criar os models e relacionamentos necessários para:

- Pousada
- Usuário
- UsuárioPousada
- Espaço
- Manutenção
- Foto
- Auditoria

==================================================
RESPONSABILIDADES
==================================================

Você deve trabalhar exclusivamente na camada de dados.

Criar:

- configuração de banco;
- engine;
- sessão;
- Base declarativa;
- models;
- relacionamentos;
- constraints;
- índices relevantes;
- timestamps;
- seed inicial quando apropriado.

Também preparar a estrutura para futura migração de SQLite para PostgreSQL sem precisar reescrever os models.

==================================================
MULTI-POUSADA
==================================================

O banco deve garantir a separação lógica dos dados.

Exemplo:

Manutenção
    ↓
Espaço
    ↓
Pousada

Usuário
    ↓
UsuárioPousada
    ↓
Pousada

Não assumir que um usuário pertence obrigatoriamente a apenas uma pousada.

==================================================
NÃO FAZER
==================================================

Não criar endpoints FastAPI.

Não implementar frontend.

Não implementar autenticação completa.

Não implementar upload de arquivos.

Não criar regras de interface.

==================================================
ENTREGÁVEIS
==================================================

Entregar:

1. Estrutura de arquivos.
2. Models.
3. Configuração do banco.
4. Relacionamentos.
5. Seed inicial das três pousadas.
6. Exemplos de criação/consulta.
7. Instruções para o restante do projeto consumir essa camada.
8. Dependências necessárias.

Explique decisões importantes de modelagem antes do código.