# PROMPT — ENCARREGADO DO BACKEND

Você é o responsável exclusivamente pelo BACKEND de um sistema web interno de gestão de manutenção para três pousadas:

* Pousada Atlantic
* Flor de Magnólia
* Amada Terra

Stack planejada:

* Python
* FastAPI
* SQLAlchemy
* SQLite inicialmente
* Pydantic
* autenticação e autorização no backend

O sistema será hospedado inicialmente em um computador dentro de uma das pousadas e poderá atender as três pousadas através de uma única aplicação.

---

# 1. OBJETIVO DESTE BLOCO

Implementar corretamente o conceito de:

> **Lista de funcionários da manutenção por pousada**

O campo:

```text
responsavel_id
```

da entidade `Manutencao` deverá apontar para um registro de `Usuario`.

Entretanto, apenas usuários elegíveis para atuar como funcionários da manutenção da pousada poderão ser selecionados como responsáveis.

---

# 2. MODELO CONCEITUAL

A relação deve ser:

```text
Pousada
   │
   ├── UsuarioPousada
   │       │
   │       └── Usuario
   │
   └── Funcionários da manutenção
             │
             └── Usuario
```

A manutenção terá:

```text
Manutencao.responsavel_id
        ↓
Usuario.id
```

E também:

```text
Manutencao.criado_por_id
        ↓
Usuario.id
```

Esses campos possuem funções diferentes.

### `criado_por_id`

Usuário que registrou a manutenção.

Deve ser obrigatório e não deve ser utilizado como responsável automaticamente.

### `responsavel_id`

Funcionário encarregado de executar/resolver a manutenção.

Pode ser `NULL`.

---

# 3. BANCO DE DADOS

O modelo `Usuario` deverá possuir, no mínimo:

```text
id
nome
username
password_hash
ativo
criado_em
atualizado_em
```

O relacionamento com pousadas será feito por:

```text
UsuarioPousada
```

com:

```text
usuario_id
pousada_id
```

---

# 4. RESPONSAVEL_ID

Adicionar à tabela/modelo `Manutencao`:

```text
responsavel_id
```

Tipo conceitual:

```text
Integer | NULL
```

com Foreign Key:

```text
usuario.id
```

O campo deverá permitir:

```text
NULL
```

porque uma manutenção pode inicialmente estar:

```text
Não atribuída
```

---

# 5. EXCLUSÃO DE USUÁRIOS

Não utilizar exclusão física de usuários como comportamento normal.

O sistema deve preferir:

```text
ativo = false
```

Isso preserva o histórico das manutenções.

Uma manutenção antiga poderá continuar apontando para:

```text
responsavel_id = 7
```

mesmo quando:

```text
usuario.id = 7
ativo = false
```

---

# 6. REGRA DE ELEGIBILIDADE

Para a primeira versão, considerar como funcionários da manutenção os usuários que:

1. pertencem à pousada através de `UsuarioPousada`;
2. estão ativos;
3. possuem o perfil/role apropriado para manutenção.

A implementação inicial deverá considerar:

```text
role = MANUTENCAO
```

como critério de elegibilidade.

Não permitir que o frontend determine essa regra.

A validação deve ocorrer no backend.

---

# 7. ENDPOINT PRINCIPAL

Criar:

```http
GET /api/pousadas/{pousada_id}/funcionarios-manutencao
```

Objetivo:

Retornar os funcionários de manutenção disponíveis para aquela pousada.

Exemplo:

```http
GET /api/pousadas/1/funcionarios-manutencao
```

Resposta:

```json
{
  "data": [
    {
      "id": 7,
      "nome": "Carlos Silva",
      "username": "carlos",
      "ativo": true
    },
    {
      "id": 8,
      "nome": "João Santos",
      "username": "joao",
      "ativo": true
    }
  ],
  "total": 2
}
```

Por padrão, esse endpoint deverá retornar apenas funcionários:

```text
ativos
+
pertencentes à pousada
+
elegíveis para manutenção
```

---

# 8. NÃO EXPOR SENHAS

O endpoint jamais deverá retornar:

```text
password
password_hash
```

A resposta pública deverá conter somente os campos necessários para a interface.

---

# 9. CRIAÇÃO DE MANUTENÇÃO

Endpoint:

```http
POST /api/pousadas/{pousada_id}/manutencoes
```

Payload esperado:

```json
{
  "espaco_id": 12,
  "responsavel_id": 7,
  "tipo": "eletrica",
  "descricao": "Lâmpada queimada",
  "status": "pendente",
  "data": "2026-09-17",
  "valor": 0,
  "categoria_custo": "material"
}
```

O backend deverá obter o usuário autenticado e definir:

```text
criado_por_id
```

Não confiar em um `criado_por_id` enviado pelo frontend.

---

# 10. RESPONSAVEL_ID NULL

Deve ser permitido:

```json
{
  "responsavel_id": null
}
```

Nesse caso a manutenção será criada sem funcionário atribuído.

---

# 11. VALIDAÇÃO DO RESPONSAVEL_ID

Quando:

```text
responsavel_id != null
```

o backend deverá verificar:

### 1. Usuário existe

Se não:

```json
{
  "error": {
    "code": "RESPONSAVEL_NAO_ENCONTRADO",
    "message": "Funcionário responsável não encontrado."
  }
}
```

### 2. Usuário está ativo

Se não:

```json
{
  "error": {
    "code": "RESPONSAVEL_INATIVO",
    "message": "O funcionário selecionado está inativo."
  }
}
```

### 3. Usuário pertence à pousada

Se não:

```json
{
  "error": {
    "code": "RESPONSAVEL_INVALIDO",
    "message": "O funcionário selecionado não pertence à pousada."
  }
}
```

### 4. Usuário é elegível

Se não:

```json
{
  "error": {
    "code": "RESPONSAVEL_NAO_ELEGIVEL",
    "message": "O usuário selecionado não pode ser responsável por uma manutenção."
  }
}
```

Essas validações são obrigatórias no backend.

---

# 12. SEGURANÇA CONTRA IDs DE OUTRA POUSADA

Não confiar somente em:

```text
responsavel_id
```

O backend deverá verificar a relação:

```text
responsavel
    ↓
UsuarioPousada
    ↓
pousada_id da manutenção
```

Exemplo:

```text
Pousada Atlantic
    funcionário 7

Flor de Magnólia
    funcionário 20
```

Uma requisição:

```json
{
  "responsavel_id": 20
}
```

para uma manutenção da Atlantic deverá ser rejeitada.

---

# 13. RESPOSTA DA MANUTENÇÃO

As respostas de manutenção devem retornar:

```json
{
  "id": 101,
  "pousada_id": 1,
  "espaco_id": 12,
  "criado_por_id": 3,
  "responsavel_id": 7,
  "responsavel": {
    "id": 7,
    "nome": "Carlos Silva",
    "ativo": true
  },
  "tipo": "eletrica",
  "descricao": "Lâmpada queimada",
  "status": "pendente",
  "data": "2026-09-17",
  "valor": 0,
  "categoria_custo": "material",
  "criado_em": "2026-09-17T20:00:00",
  "atualizado_em": "2026-09-17T20:00:00"
}
```

Quando não houver responsável:

```json
{
  "responsavel_id": null,
  "responsavel": null
}
```

O objeto expandido `responsavel` existe para facilitar o frontend e evitar que ele precise consultar cada usuário individualmente.

---

# 14. EDIÇÃO

Endpoint:

```http
PUT /api/manutencoes/{manutencao_id}
```

Deve aceitar:

```json
{
  "responsavel_id": 8
}
```

ou:

```json
{
  "responsavel_id": null
}
```

Toda alteração deverá repetir as mesmas validações utilizadas na criação.

---

# 15. AUDITORIA

A alteração do responsável deve gerar registro na entidade:

```text
Auditoria
```

Exemplo:

```json
{
  "entidade": "manutencao",
  "entidade_id": 101,
  "acao": "atualizacao",
  "dados_anteriores": {
    "responsavel_id": 7
  },
  "dados_novos": {
    "responsavel_id": 8
  }
}
```

Também registrar quando uma manutenção passa de:

```text
responsavel_id = 7
```

para:

```text
responsavel_id = null
```

---

# 16. FILTRO DE RELATÓRIOS

O endpoint:

```http
GET /api/pousadas/{pousada_id}/relatorios/manutencoes
```

deverá suportar:

```text
responsavel_id
```

Exemplo:

```http
GET /api/pousadas/1/relatorios/manutencoes?responsavel_id=7
```

Deve retornar apenas manutenções cujo:

```text
responsavel_id = 7
```

Também deverá ser possível filtrar manutenções sem responsável:

```text
responsavel_id=null
```

A forma exata do parâmetro para `null` deverá ser definida e documentada no contrato da API; não criar comportamento implícito sem documentá-lo.

---

# 17. AUTORIZAÇÃO

A existência do endpoint não significa que qualquer usuário poderá utilizá-lo para alterar responsáveis.

A autorização deverá respeitar os papéis definidos pelo sistema:

```text
ADMIN
CHEFE
MANUTENCAO
```

A implementação deve separar:

```text
autenticação
```

de:

```text
autorização
```

e não confiar no frontend para impedir operações.

---

# 18. BANCO MULTI-POUSADA

Não criar tabelas separadas como:

```text
funcionarios_atlantic
funcionarios_magnolia
funcionarios_amada_terra
```

O banco deve permanecer multi-pousada.

Utilizar:

```text
Usuario
UsuarioPousada
Pousada
```

para representar a associação.

---

# 19. RELACIONAMENTOS SQLALCHEMY

Conceitualmente:

```text
Manutencao
    ├── criado_por_id → Usuario.id
    └── responsavel_id → Usuario.id
```

São dois relacionamentos diferentes com a mesma tabela.

O relacionamento deverá permitir acessar:

```python
manutencao.criado_por
```

e:

```python
manutencao.responsavel
```

sem confundir os dois.

---

# 20. MIGRAÇÃO DO BANCO

Caso o projeto já possua a tabela `manutencao`, adicionar:

```text
responsavel_id
```

como coluna nullable.

Não destruir dados existentes.

Manutenções antigas deverão permanecer:

```text
responsavel_id = NULL
```

até que sejam manualmente atribuídas.

---

# 21. CONTRATO FINAL DA API

## Listar funcionários

```http
GET /api/pousadas/{pousada_id}/funcionarios-manutencao
```

Resposta:

```json
{
  "data": [
    {
      "id": 7,
      "nome": "Carlos Silva",
      "username": "carlos",
      "ativo": true
    }
  ],
  "total": 1
}
```

---

## Criar manutenção

```http
POST /api/pousadas/{pousada_id}/manutencoes
```

Payload:

```json
{
  "espaco_id": 12,
  "responsavel_id": 7,
  "tipo": "eletrica",
  "descricao": "Lâmpada queimada",
  "status": "pendente",
  "data": "2026-09-17",
  "valor": 0,
  "categoria_custo": "material"
}
```

---

## Criar sem responsável

```json
{
  "espaco_id": 12,
  "responsavel_id": null,
  "tipo": "eletrica",
  "descricao": "Lâmpada queimada",
  "status": "pendente",
  "data": "2026-09-17",
  "valor": 0,
  "categoria_custo": "material"
}
```

---

## Atualizar responsável

```http
PUT /api/manutencoes/{manutencao_id}
```

Payload:

```json
{
  "responsavel_id": 8
}
```

---

## Remover responsável

```http
PUT /api/manutencoes/{manutencao_id}
```

Payload:

```json
{
  "responsavel_id": null
}
```

---

## Resposta da manutenção

```json
{
  "id": 101,
  "pousada_id": 1,
  "espaco_id": 12,
  "criado_por_id": 3,
  "responsavel_id": 7,
  "responsavel": {
    "id": 7,
    "nome": "Carlos Silva",
    "ativo": true
  },
  "tipo": "eletrica",
  "descricao": "Lâmpada queimada",
  "status": "pendente",
  "data": "2026-09-17",
  "valor": 0,
  "categoria_custo": "material"
}
```

---

# 22. RESTRIÇÕES IMPORTANTES

Não:

* criar lista fixa de funcionários no código;
* confiar no `responsavel_id` enviado pelo frontend;
* permitir funcionário de outra pousada;
* armazenar nome do responsável como texto dentro de `Manutencao`;
* apagar fisicamente usuários como comportamento padrão;
* retornar `password_hash`;
* colocar regra de autorização somente no frontend;
* alterar os endpoints definidos neste contrato sem atualizar a documentação;
* criar bancos separados para cada pousada.

---

# 23. RESULTADO ESPERADO

Ao final deste bloco, o backend deverá possuir uma implementação funcional onde:

```text
Pousada
   ↓
Funcionários de manutenção
   ↓
responsavel_id
   ↓
Manutencao
```

funcione de forma segura e consistente.

O frontend deverá conseguir:

```text
GET funcionários
        ↓
mostrar select
        ↓
enviar responsavel_id
        ↓
backend valida
        ↓
salva FK
        ↓
retorna responsável expandido
        ↓
frontend exibe nome
```

O backend é a autoridade final sobre todos esses dados e regras.
