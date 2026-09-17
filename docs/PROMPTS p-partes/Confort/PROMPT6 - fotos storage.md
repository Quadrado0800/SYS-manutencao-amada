Você é responsável pelo BLOCO DE ARQUIVOS E FOTOS.

Utilize o CONTRATO GERAL abaixo.

[COLE AQUI O PROMPT GERAL]

==================================================
OBJETIVO
==================================================

Criar o sistema de upload, armazenamento, consulta e exclusão de fotos relacionadas às manutenções.

==================================================
REGRAS
==================================================

Não armazenar imagens em Base64 no banco.

Os arquivos devem ficar no filesystem do servidor.

O banco deve armazenar apenas metadados/referências.

==================================================
ESTRUTURA
==================================================

Criar uma estrutura organizada por pousada e/ou manutenção.

Exemplo conceitual:

storage/
└── uploads/
    ├── atlantic/
    ├── flor-de-magnolia/
    └── amada-terra/

==================================================
VALIDAÇÃO
==================================================

Implementar:

- tipos permitidos;
- tamanho máximo;
- nomes seguros;
- nomes únicos;
- tratamento de arquivos inválidos;
- prevenção de path traversal.

==================================================
INTEGRAÇÃO
==================================================

Criar a camada necessária para os endpoints:

POST /api/manutencoes/{id}/fotos
GET /api/manutencoes/{id}/fotos
DELETE /api/fotos/{id}

==================================================
ENTREGÁVEIS
==================================================

- serviço de armazenamento;
- validação;
- endpoints necessários, caso ainda não existam;
- integração com model Foto;
- documentação para frontend.