# Mock Backend — Gestão de Manutenção

Servidor FastAPI temporário e isolado para validar o contrato REST antes do backend definitivo. Os dados vivem apenas em memória: reiniciar o processo, ou fazer `POST /api/mock/reset`, restaura o cenário inicial. Não há SQLAlchemy, SQLite, migrations, armazenamento de fotos ou autenticação real.

## Como executar

No PowerShell, a partir de `mock_backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

A API estará em `http://127.0.0.1:8000`, a documentação interativa em `http://127.0.0.1:8000/docs` e o frontend em `http://127.0.0.1:8000/`. O Mock entrega a pasta `frontend/`, portanto as chamadas relativas para `/api` usam o mesmo host e porta.

## Cenário simulado

| Pousada | Espaços | Manutenções |
| --- | --- | --- |
| Atlantic (1) | Suíte 101, Recepção, Piscina | 101 pendente/sem responsável; 102 em andamento/Carlos; 103 concluída/Pedro inativo |
| Flor de Magnólia (2) | Chalé Ipê, Cozinha Principal | 201 pendente/Lúcia |
| Amada Terra (3) | Restaurante Terra, Trilha das Palmeiras | 301 concluída/Rita |

Usuários de teste: `admin`, `chefe`, `carlos`, `joao`, `lucia`, `pedro` e `rita`. No Mock, qualquer senha não vazia é aceita para um usuário ativo. A sessão é apenas um cookie temporário; as leituras de domínio foram deixadas livres para facilitar a inspeção de endpoints e provocar cenários de erro.

Carlos e João são manutenção da Atlantic, Lúcia é da Flor de Magnólia e Rita é da Amada Terra. Pedro é um vínculo de manutenção da Atlantic, mas está inativo, preservando o cenário histórico. A Atlantic não tem funcionário de manutenção ativo vazio; para testar a lista vazia, use uma pousada criada em memória sem vínculos ou remova-os apenas durante uma sessão de teste.

## Endpoints implementados

Todos os sucessos de objeto retornam `{ "data": {...} }` e listas retornam `{ "data": [...], "total": n }`. Erros retornam `{ "error": { "code", "message" } }`.

- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/pousadas`, `GET /api/pousadas/{id}`
- `GET|POST /api/pousadas/{id}/espacos`; `GET|PUT|DELETE /api/espacos/{id}`
- `GET /api/pousadas/{id}/funcionarios-manutencao`
- `GET|POST /api/pousadas/{id}/manutencoes`; `GET|PUT|DELETE /api/manutencoes/{id}`
- `GET|POST /api/manutencoes/{id}/fotos`, `DELETE /api/fotos/{id}`
- `GET /api/pousadas/{id}/dashboard`
- `GET /api/pousadas/{id}/relatorios/manutencoes`, `/custos`, `/pendencias`
- `GET /api/pousadas/{id}/auditoria`; `POST /api/mock/reset`

Listas de manutenção e relatórios aceitam `responsavel_id`, `status`, `tipo`, `prioridade`, `data_inicio` e `data_fim` quando aplicáveis; a listagem de manutenção também aceita `espaco_id`. Valores são `Decimal` e nunca são calculados como `float`.

As validações devolvem, entre outras, `RESPONSAVEL_NAO_ENCONTRADO`, `RESPONSAVEL_INATIVO`, `RESPONSAVEL_INVALIDO`, `RESPONSAVEL_NAO_ELEGIVEL`, `ESPACO_INVALIDO` e os códigos `*_NAO_ENCONTRADO` apropriados. Exemplo: enviar `espaco_id: 30` para `POST /api/pousadas/1/manutencoes` devolve `422 ESPACO_INVALIDO`.

## Lacunas contratuais ainda pendentes

O formato definitivo de dashboard e relatórios de custos não está definido pelo contrato de resposta. O Mock usa provisoriamente contagens por status/prioridade no dashboard e `{ pousada_id, periodo, total_custos, por_categoria }` em custos. Essa estrutura não deve ser tratada como decisão definitiva da API.
