# Especificação Técnica — Campo `prioridade`

## 1. Objetivo

Adicionar o campo `prioridade` à entidade **Manutenção**, permitindo classificar cada registro conforme seu nível de prioridade.

## 2. Valores permitidos

O campo deve aceitar exclusivamente os seguintes valores:

```text
alta
media
baixa
```

Representação na interface:

| Valor da API | Exibição         |
| ------------ | ---------------- |
| `alta`       | Alta prioridade  |
| `media`      | Media Prioridade |
| `baixa`      | Baixa Prioridade |

Os valores `alta`, `media` e `baixa` devem ser considerados os valores oficiais do contrato da API.

## 3. Modelo / Banco de Dados

Adicionar o campo:

```python
prioridade
```

Tipo recomendado: `String` ou equivalente compatível com a estrutura atual do projeto.

O campo deve possuir validação para impedir valores diferentes de:

```text
alta
media
baixa
```

Para registros existentes, definir um valor padrão/migração conforme a estratégia adotada pelo backend.

## 4. Schemas da API

O campo deve estar presente nos schemas de:

* criação de manutenção;
* atualização de manutenção;
* resposta de manutenção.

Exemplo de criação:

```json
{
  "espaco_id": 1,
  "tipo": "eletrica",
  "descricao": "Troca de tomada",
  "status": "pendente",
  "prioridade": "alta",
  "responsavel_id": 12,
  "valor": "150.00",
  "categoria_custo": "material"
}
```

## 5. Endpoints afetados

O campo deve ser aceito e retornado nos endpoints existentes de manutenção:

```text
POST /api/pousadas/{id}/manutencoes
PUT /api/manutencoes/{id}
GET /api/manutencoes/{id}
GET /api/pousadas/{id}/manutencoes
```

Não é necessário criar um novo endpoint exclusivamente para prioridade.

## 6. Validação

Requisições contendo valores inválidos devem ser rejeitadas pelo backend.

Exemplo inválido:

```json
{
  "prioridade": "urgente"
}
```

A validação deve ocorrer no backend, independentemente da validação existente no frontend.

## 7. Compatibilidade

A inclusão de `prioridade` não deve alterar os demais campos ou contratos existentes da entidade Manutenção.

O frontend utilizará diretamente os valores:

```text
alta
media
baixa
```

e fará a tradução para os textos apresentados ao usuário.
