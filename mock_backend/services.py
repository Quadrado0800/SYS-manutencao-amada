"""Regras em memória e serialização do contrato do Mock Backend."""
from datetime import datetime
from decimal import Decimal

from fastapi import HTTPException

from dados import fresh_data


class MockService:
    def __init__(self): self.reset()
    def reset(self): self.db = fresh_data(); self.sessions = set()
    def now(self): return datetime.now().replace(microsecond=0).isoformat()
    def error(self, status, code, message): raise HTTPException(status_code=status, detail={"code": code, "message": message})
    def next_id(self, collection): return max((item["id"] for item in self.db[collection]), default=0) + 1
    def pousada(self, ident):
        item = next((x for x in self.db["pousadas"] if x["id"] == ident), None)
        if not item: self.error(404, "POUSADA_NAO_ENCONTRADA", "Pousada não encontrada.")
        return item
    def espaco(self, ident):
        item = next((x for x in self.db["espacos"] if x["id"] == ident), None)
        if not item: self.error(404, "ESPACO_NAO_ENCONTRADO", "Espaço não encontrado.")
        return item
    def manutencao(self, ident):
        item = next((x for x in self.db["manutencoes"] if x["id"] == ident), None)
        if not item: self.error(404, "MANUTENCAO_NAO_ENCONTRADA", "Manutenção não encontrada.")
        return item
    def usuario(self, ident): return next((x for x in self.db["usuarios"] if x["id"] == ident), None)
    def public_user(self, user): return {k: v for k, v in user.items() if k not in {"senha", "senha_hash"}}
    def responsible(self, ident):
        if ident is None: return None
        u = self.usuario(ident)
        return {"id": u["id"], "nome": u["nome"], "ativo": u["ativo"]} if u else None
    def maintenance_output(self, item):
        result = item.copy(); result["responsavel"] = self.responsible(item["responsavel_id"])
        return result
    def validate_responsavel(self, pousada_id, responsavel_id):
        if responsavel_id is None: return
        user = self.usuario(responsavel_id)
        if not user: self.error(422, "RESPONSAVEL_NAO_ENCONTRADO", "O funcionário selecionado não foi encontrado.")
        if not user["ativo"]: self.error(422, "RESPONSAVEL_INATIVO", "O funcionário selecionado está inativo.")
        links = [x for x in self.db["vinculos"] if x["usuario_id"] == responsavel_id]
        link = next((x for x in links if x["pousada_id"] == pousada_id), None)
        if not link: self.error(422, "RESPONSAVEL_INVALIDO", "O funcionário selecionado não pertence à pousada.")
        if link["papel"] != "MANUTENCAO": self.error(422, "RESPONSAVEL_NAO_ELEGIVEL", "O funcionário selecionado não é elegível para manutenção.")
    def validate_espaco(self, pousada_id, espaco_id):
        espaco = self.espaco(espaco_id)
        if espaco["pousada_id"] != pousada_id: self.error(422, "ESPACO_INVALIDO", "O espaço selecionado não pertence à pousada.")
        return espaco
    def audit(self, item, before, action="atualizacao"):
        self.db["auditoria"].append({"id": self.next_id("auditoria"), "pousada_id": item["pousada_id"], "usuario_id": 1, "entidade": "manutencao", "entidade_id": item["id"], "acao": action, "dados_anteriores": before, "dados_novos": item.copy(), "criado_em": self.now()})
    def filtered(self, pousada_id, filters):
        rows = [x for x in self.db["manutencoes"] if x["pousada_id"] == pousada_id]
        aliases = {"type": "tipo", "priority": "prioridade", "dateStart": "data_inicio", "dateEnd": "data_fim"}
        filters = {aliases.get(k, k): v for k, v in filters.items() if v not in (None, "")}
        for key in ("espaco_id", "responsavel_id"):
            if key in filters: rows = [x for x in rows if x[key] == int(filters[key])]
        for key in ("status", "tipo", "prioridade"):
            if key in filters: rows = [x for x in rows if x[key] == filters[key]]
        if filters.get("data_inicio"): rows = [x for x in rows if x["data_registro"] >= filters["data_inicio"]]
        if filters.get("data_fim"): rows = [x for x in rows if x["data_registro"] <= filters["data_fim"]]
        return rows
    def cost_report(self, pousada_id, filters):
        rows = self.filtered(pousada_id, filters); categories = {}
        for row in rows: categories[row["categoria_custo"]] = categories.get(row["categoria_custo"], Decimal("0")) + Decimal(row["valor"])
        return {"pousada_id": pousada_id, "periodo": {"data_inicio": filters.get("data_inicio"), "data_fim": filters.get("data_fim")}, "total_custos": str(sum(categories.values(), Decimal("0"))), "por_categoria": [{"categoria_custo": k, "total": str(v)} for k, v in categories.items()]}


service = MockService()
