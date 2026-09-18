"""Servidor FastAPI temporário para validar o contrato do frontend."""
from datetime import date
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles

from models import EspacoInput, EspacoUpdate, LoginInput, ManutencaoInput, ManutencaoUpdate
from services import service

app = FastAPI(title="Mock Backend — Gestão de Manutenção", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


def obj(data, status=200): return JSONResponse(status_code=status, content={"data": data})
def listing(data): return {"data": data, "total": len(data)}
def dumped(model): return model.model_dump(exclude_unset=True, mode="json")
def authenticated(request: Request):
    if request.cookies.get("mock_session") not in service.sessions:
        service.error(401, "UNAUTHORIZED", "Não autenticado.")
def current_user(request: Request):
    authenticated(request); return service.public_user(service.usuario(1))


@app.exception_handler(HTTPException)
async def http_error(request: Request, exc: HTTPException):
    detail = exc.detail if isinstance(exc.detail, dict) else {"code": "HTTP_ERROR", "message": str(exc.detail)}
    return JSONResponse(status_code=exc.status_code, content={"error": detail})


@app.exception_handler(Exception)
async def general_error(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"error": {"code": "INTERNAL_ERROR", "message": "Erro interno do Mock Backend."}})


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"error": {"code": "VALIDATION_ERROR", "message": "Os dados enviados não são válidos."}})


@app.get("/api/health")
def health(): return {"data": {"service": "mock_backend", "status": "ok"}}


@app.post("/api/auth/login")
async def login(request: Request):
    """Login simulado. Qualquer senha não vazia é aceita para um username de teste."""
    payload = await request.json()
    if not isinstance(payload, dict):
        service.error(422, "VALIDATION_ERROR", "Envie username e password.")
    input_data = LoginInput.model_validate(payload)
    user = next((x for x in service.db["usuarios"] if x["username"] == input_data.username and x["ativo"]), None)
    if not user: service.error(401, "CREDENCIAIS_INVALIDAS", "Usuário ou senha inválidos.")
    service.sessions.add(str(user["id"]))
    # A sessão usa um cookie mock; a API real decidirá a autenticação definitiva.
    response = obj({**service.public_user(user), "role": "admin", "pousadas": service.db["pousadas"]})
    response.set_cookie("mock_session", str(user["id"]), httponly=True, samesite="lax")
    return response


@app.post("/api/auth/logout")
def logout(request: Request):
    token = request.cookies.get("mock_session")
    if token: service.sessions.discard(token)
    response = obj({"logout": True}); response.delete_cookie("mock_session"); return response


@app.get("/api/auth/me")
def me(request: Request): return obj(current_user(request))


@app.get("/api/pousadas")
def list_pousadas(): return listing(service.db["pousadas"])

@app.get("/api/pousadas/{pousada_id}")
def get_pousada(pousada_id: int): return obj(service.pousada(pousada_id))


@app.get("/api/pousadas/{pousada_id}/funcionarios-manutencao")
def funcionarios(pousada_id: int):
    service.pousada(pousada_id)
    ids = {x["usuario_id"] for x in service.db["vinculos"] if x["pousada_id"] == pousada_id and x["papel"] == "MANUTENCAO"}
    rows = [{"id": x["id"], "nome": x["nome"], "username": x["username"], "ativo": x["ativo"]} for x in service.db["usuarios"] if x["id"] in ids and x["ativo"]]
    return listing(rows)


@app.get("/api/pousadas/{pousada_id}/espacos")
def list_espacos(pousada_id: int):
    service.pousada(pousada_id); return listing([x for x in service.db["espacos"] if x["pousada_id"] == pousada_id])

@app.post("/api/pousadas/{pousada_id}/espacos")
def create_espaco(pousada_id: int, input_data: EspacoInput):
    service.pousada(pousada_id); now = service.now()
    item = {"id": service.next_id("espacos"), "pousada_id": pousada_id, **dumped(input_data), "criado_em": now, "atualizado_em": now}
    service.db["espacos"].append(item); return obj(item, 201)

@app.get("/api/espacos/{espaco_id}")
def get_espaco(espaco_id: int): return obj(service.espaco(espaco_id))

@app.put("/api/espacos/{espaco_id}")
def update_espaco(espaco_id: int, input_data: EspacoUpdate):
    item = service.espaco(espaco_id); item.update(dumped(input_data)); item["atualizado_em"] = service.now(); return obj(item)

@app.delete("/api/espacos/{espaco_id}", status_code=204)
def delete_espaco(espaco_id: int):
    item = service.espaco(espaco_id)
    if any(x["espaco_id"] == espaco_id for x in service.db["manutencoes"]): service.error(409, "ESPACO_EM_USO", "Não é possível excluir um espaço com manutenções.")
    service.db["espacos"].remove(item); return Response(status_code=204)


@app.get("/api/pousadas/{pousada_id}/manutencoes")
def list_manutencoes(pousada_id: int, espaco_id: int | None = None, responsavel_id: int | None = None, status: str | None = None, tipo: str | None = None, prioridade: str | None = None, data_inicio: str | None = None, data_fim: str | None = None):
    service.pousada(pousada_id)
    rows = service.filtered(pousada_id, locals())
    return listing([service.maintenance_output(x) for x in rows])

@app.post("/api/pousadas/{pousada_id}/manutencoes")
def create_manutencao(pousada_id: int, input_data: ManutencaoInput):
    service.pousada(pousada_id); payload = dumped(input_data)
    service.validate_espaco(pousada_id, payload["espaco_id"]); service.validate_responsavel(pousada_id, payload.get("responsavel_id"))
    now = service.now(); registro = payload.get("data_registro") or date.today().isoformat()
    item = {"id": service.next_id("manutencoes"), "pousada_id": pousada_id, "criado_por_id": 1, **payload, "data_registro": registro, "valor": str(payload.get("valor") or "0.00"), "categoria_custo": payload.get("categoria_custo") or "outro", "criado_em": now, "atualizado_em": now}
    if item["status"] == "concluido" and not item["data_conclusao"]: item["data_conclusao"] = registro
    service.db["manutencoes"].append(item); service.audit(item, {}, "criacao"); return obj(service.maintenance_output(item), 201)

@app.get("/api/manutencoes/{manutencao_id}")
def get_manutencao(manutencao_id: int): return obj(service.maintenance_output(service.manutencao(manutencao_id)))

@app.put("/api/manutencoes/{manutencao_id}")
def update_manutencao(manutencao_id: int, input_data: ManutencaoUpdate):
    item = service.manutencao(manutencao_id); changes = dumped(input_data); before = item.copy()
    if "espaco_id" in changes: service.validate_espaco(item["pousada_id"], changes["espaco_id"])
    if "responsavel_id" in changes: service.validate_responsavel(item["pousada_id"], changes["responsavel_id"])
    if "valor" in changes: changes["valor"] = str(changes["valor"])
    item.update(changes)
    if item["status"] == "concluido" and not item["data_conclusao"]: item["data_conclusao"] = date.today().isoformat()
    item["atualizado_em"] = service.now(); service.audit(item, before); return obj(service.maintenance_output(item))

@app.delete("/api/manutencoes/{manutencao_id}", status_code=204)
def delete_manutencao(manutencao_id: int):
    item = service.manutencao(manutencao_id); service.db["manutencoes"].remove(item); service.db["fotos"][:] = [x for x in service.db["fotos"] if x["manutencao_id"] != manutencao_id]; service.audit(item, item.copy(), "exclusao"); return Response(status_code=204)


@app.get("/api/manutencoes/{manutencao_id}/fotos")
def list_fotos(manutencao_id: int):
    service.manutencao(manutencao_id); return listing([x for x in service.db["fotos"] if x["manutencao_id"] == manutencao_id])

@app.post("/api/manutencoes/{manutencao_id}/fotos")
async def upload_foto(manutencao_id: int, file: Annotated[UploadFile, File()], descricao: Annotated[str | None, Form()] = None):
    service.manutencao(manutencao_id); item = {"id": service.next_id("fotos"), "manutencao_id": manutencao_id, "nome_arquivo": file.filename or "arquivo", "caminho": f"/mock/uploads/{file.filename or 'arquivo'}", "tamanho": file.size or 0, "mime_type": file.content_type or "application/octet-stream", "criada_em": service.now()}
    service.db["fotos"].append(item); return obj(item, 201)

@app.delete("/api/fotos/{foto_id}", status_code=204)
def delete_foto(foto_id: int):
    item = next((x for x in service.db["fotos"] if x["id"] == foto_id), None)
    if not item: service.error(404, "FOTO_NAO_ENCONTRADA", "Foto não encontrada.")
    service.db["fotos"].remove(item); return Response(status_code=204)


@app.get("/api/pousadas/{pousada_id}/dashboard")
def dashboard(pousada_id: int):
    service.pousada(pousada_id); rows = service.filtered(pousada_id, {})
    return obj({"pousada_id": pousada_id, "total_manutencoes": len(rows), "por_status": {s: sum(x["status"] == s for x in rows) for s in ("pendente", "em_andamento", "concluido")}, "por_prioridade": {p: sum(x["prioridade"] == p for x in rows) for p in ("alta", "media", "baixa")}})

@app.get("/api/pousadas/{pousada_id}/relatorios/manutencoes")
def relatorio_manutencoes(pousada_id: int, responsavel_id: int | None = None, status: str | None = None, tipo: str | None = None, prioridade: str | None = None, data_inicio: str | None = None, data_fim: str | None = None):
    service.pousada(pousada_id); return listing([service.maintenance_output(x) for x in service.filtered(pousada_id, locals())])

@app.get("/api/pousadas/{pousada_id}/relatorios/custos")
def relatorio_custos(pousada_id: int, data_inicio: str | None = None, data_fim: str | None = None):
    service.pousada(pousada_id); return obj(service.cost_report(pousada_id, {"data_inicio": data_inicio, "data_fim": data_fim}))

@app.get("/api/pousadas/{pousada_id}/relatorios/pendencias")
def relatorio_pendencias(pousada_id: int, responsavel_id: int | None = None, prioridade: str | None = None, data_inicio: str | None = None, data_fim: str | None = None):
    service.pousada(pousada_id); filters = {"responsavel_id": responsavel_id, "prioridade": prioridade, "data_inicio": data_inicio, "data_fim": data_fim}; rows = [x for x in service.filtered(pousada_id, filters) if x["status"] in ("pendente", "em_andamento")]; return listing([service.maintenance_output(x) for x in rows])

@app.get("/api/pousadas/{pousada_id}/auditoria")
def auditoria(pousada_id: int):
    service.pousada(pousada_id); return listing([x for x in service.db["auditoria"] if x["pousada_id"] == pousada_id])

@app.post("/api/mock/reset")
def reset_mock(): service.reset(); return obj({"reset": True})


# Mantém frontend e API no mesmo host/porta durante a validação local.
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
