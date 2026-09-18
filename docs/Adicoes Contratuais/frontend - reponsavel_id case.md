# PROMPT — ENCARREGADO DO FRONTEND

Você é o responsável exclusivamente pelo FRONTEND de um sistema web interno de gestão de manutenção para três pousadas:

* Pousada Atlantic
* Flor de Magnólia
* Amada Terra

O projeto utiliza:

* HTML
* CSS
* JavaScript
* FastAPI no backend
* API REST
* SQLite inicialmente
* Frontend consumindo exclusivamente a API através de `fetch()`

Seu trabalho deve respeitar o contrato existente do projeto e não deve criar regras de negócio que pertencem ao backend.

---

## 1. OBJETIVO DESTE BLOCO

Implementar no frontend o conceito de:

> **Lista de funcionários da manutenção**

Cada pousada possui sua própria lista de funcionários da manutenção.

O usuário responsável por uma manutenção NÃO deve ser digitado manualmente.

Em vez disso, o frontend deve:

1. consultar a API os funcionários disponíveis;
2. apresentar esses funcionários em um `<select>`;
3. permitir a opção `Não atribuído`;
4. enviar o `responsavel_id` para o backend;
5. receber do backend os dados do responsável;
6. exibir o nome do responsável nas telas, tabelas, detalhes e relatórios.

---

# 2. REGRA FUNDAMENTAL

Nunca utilizar:

```text
responsavel: "Carlos"
```

ou:

```text
responsavel: "João"
```

como campo principal da manutenção.

O frontend deve trabalhar com:

```json
{
  "responsavel_id": 7
}
```

O nome é apenas informação de apresentação.

---

# 3. ENDPOINT UTILIZADO PELO FRONTEND

Para carregar os funcionários da manutenção da pousada atual:

```http
GET /api/pousadas/{pousada_id}/funcionarios-manutencao
```

Exemplo:

```http
GET /api/pousadas/1/funcionarios-manutencao
```

Resposta esperada:

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

O frontend deve utilizar principalmente:

* `id`
* `nome`
* `ativo`

O `username` pode ser utilizado apenas quando fizer sentido para identificação administrativa.

---

# 4. SELECT DE RESPONSÁVEL

No formulário de criação/edição de manutenção deverá existir:

```text
Responsável
[ Não atribuído       ▼ ]
```

Exemplo:

```text
Responsável
[ Carlos Silva        ▼ ]
```

As opções devem ser geradas dinamicamente a partir da API.

Estrutura conceitual:

```html
<select id="responsavel_id">
    <option value="">Não atribuído</option>
</select>
```

Não colocar funcionários diretamente no HTML.

Não fazer:

```javascript
const funcionarios = [
    { id: 7, nome: "Carlos" }
];
```

Os dados devem vir da API.

---

# 5. CRIAÇÃO DE MANUTENÇÃO

Ao criar uma manutenção, o frontend deverá enviar:

```http
POST /api/pousadas/{pousada_id}/manutencoes
```

Exemplo de payload:

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

Quando não houver responsável:

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

O frontend não deve tentar decidir se o funcionário pode ou não ser responsável.

Essa validação pertence ao backend.

---

# 6. EDIÇÃO DE MANUTENÇÃO

Para editar:

```http
PUT /api/manutencoes/{manutencao_id}
```

Exemplo:

```json
{
  "responsavel_id": 8
}
```

Também deve ser possível remover a atribuição:

```json
{
  "responsavel_id": null
}
```

A interface deve refletir imediatamente a nova atribuição após resposta positiva da API.

---

# 7. RESPOSTA ESPERADA DA MANUTENÇÃO

Quando o frontend receber uma manutenção, espera-se que a API forneça:

```json
{
  "id": 101,
  "pousada_id": 1,
  "espaco_id": 12,
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

Quando não houver responsável:

```json
{
  "responsavel_id": null,
  "responsavel": null
}
```

O frontend deve tratar os dois casos.

---

# 8. EXIBIÇÃO NAS MANUTENÇÕES

Nas tabelas/listagens, mostrar:

```text
Responsável
Carlos Silva
```

ou:

```text
Responsável
Não atribuído
```

Nunca mostrar:

```text
Responsável: 7
```

O ID é utilizado internamente.

---

# 9. FILTRO POR RESPONSÁVEL

Na tela de relatórios/manutenções, adicionar:

```text
Responsável
[ Todos os funcionários ▼ ]
```

Opções:

```text
Todos
Não atribuído
Carlos Silva
João Santos
...
```

Quando o usuário selecionar um funcionário, o frontend deverá utilizar:

```text
responsavel_id=7
```

na requisição da API.

Exemplo:

```http
GET /api/pousadas/1/relatorios/manutencoes?responsavel_id=7
```

Não filtrar apenas visualmente no JavaScript se a API possuir suporte ao filtro.

---

# 10. TROCA DE POUSADA

O sistema possui três pousadas.

Quando o usuário mudar de pousada:

```text
Pousada Atlantic
        ↓
Flor de Magnólia
```

o frontend deve:

1. atualizar o contexto da pousada;
2. buscar novamente os funcionários;
3. limpar funcionários da pousada anterior;
4. atualizar o `<select>`;
5. atualizar filtros e telas relacionadas.

Nunca reutilizar automaticamente funcionários de outra pousada.

---

# 11. FUNCIONÁRIO INATIVO

Funcionários inativos normalmente não devem aparecer como opção para novas atribuições.

Porém, uma manutenção antiga pode continuar mostrando:

```text
Carlos Silva
```

mesmo que Carlos esteja inativo.

Isso é importante para preservar o histórico.

Portanto:

### Novo cadastro/edição

Mostrar somente funcionários retornados como disponíveis pela API.

### Manutenção existente

Se a API retornar:

```json
{
  "responsavel_id": 7,
  "responsavel": {
    "id": 7,
    "nome": "Carlos Silva",
    "ativo": false
  }
}
```

mostrar:

```text
Carlos Silva (inativo)
```

Não substituir automaticamente por `Não atribuído`.

---

# 12. ESTADO DO FRONTEND

Não utilizar `localStorage` como banco de dados das manutenções.

O sistema antigo utilizava:

```javascript
localStorage
```

Isso deverá ser substituído pela API.

O frontend poderá utilizar estado temporário/cache em memória para funcionários, mas a fonte oficial dos dados será o backend.

---

# 13. TRATAMENTO DE ERROS

Se a API responder:

```json
{
  "error": {
    "code": "RESPONSAVEL_INVALIDO",
    "message": "Funcionário não pertence à pousada."
  }
}
```

o frontend deverá apresentar uma mensagem compreensível ao usuário.

Exemplo:

```text
Não foi possível atribuir este funcionário.
O funcionário selecionado não está disponível para esta pousada.
```

Não exibir apenas o código técnico.

---

# 14. NÃO CRIAR REGRAS DE NEGÓCIO NO FRONTEND

O frontend não deve assumir que:

```text
id 7 = Carlos
```

nem que:

```text
todo usuário MANUTENCAO pode necessariamente ser responsável.
```

Essas informações pertencem ao backend.

O frontend apenas consome o contrato da API.

---

# 15. COMPATIBILIDADE COM O TEMPLATE ATUAL

O arquivo HTML existente:

```text
pousada_atlantic_manutencao_template_2.html
```

deve ser tratado como referência visual e funcional.

A implementação deverá preservar, quando possível:

* layout;
* formulários;
* tabela de manutenções;
* filtros;
* relatórios;
* status;
* tipos de manutenção;
* categorias de custo;
* experiência de uso.

Porém, a persistência deverá migrar de `localStorage` para a API FastAPI.

---

# 16. RESULTADO ESPERADO

Ao final deste bloco, o frontend deverá permitir:

* carregar funcionários da manutenção;
* selecionar responsável;
* criar manutenção com `responsavel_id`;
* editar responsável;
* remover responsável;
* visualizar responsável;
* identificar funcionário inativo em registros antigos;
* filtrar manutenções por responsável;
* trocar de pousada sem misturar funcionários;
* tratar erros da API.

Não implementar banco de dados, autenticação, regras de autorização ou lógica de persistência no frontend.

Essas responsabilidades pertencem ao backend.

---

## CONTRATO QUE NÃO DEVE SER ALTERADO

Endpoint:

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

Manutenção:

```json
{
  "responsavel_id": 7,
  "responsavel": {
    "id": 7,
    "nome": "Carlos Silva",
    "ativo": true
  }
}
```

Sem responsável:

```json
{
  "responsavel_id": null,
  "responsavel": null
}
```

O frontend deve ser desenvolvido contra esse contrato sem inventar endpoints alternativos.
