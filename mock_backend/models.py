"""Modelos de entrada do Mock Backend.

Os modelos representam o contrato HTTP, não um modelo de persistência.
"""
from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Status = Literal["pendente", "em_andamento", "concluido"]
Prioridade = Literal["alta", "media", "baixa"]
TipoManutencao = Literal["pintura", "eletrica", "hidraulica", "limpeza", "mobiliario", "ocorrencia"]
CategoriaCusto = Literal["material", "mao_de_obra", "equipamento", "outro"]


class EspacoInput(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    identificador: str = Field(min_length=1, max_length=60)
    tipo: str = Field(min_length=1, max_length=60)
    andar: str | None = Field(default=None, max_length=60)
    ordem: int = 0
    ativo: bool = True


class EspacoUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    nome: str | None = Field(default=None, min_length=1, max_length=120)
    identificador: str | None = Field(default=None, min_length=1, max_length=60)
    tipo: str | None = Field(default=None, min_length=1, max_length=60)
    andar: str | None = Field(default=None, max_length=60)
    ordem: int | None = None
    ativo: bool | None = None


class ManutencaoInput(BaseModel):
    espaco_id: int
    tipo: TipoManutencao
    descricao: str = Field(min_length=1, max_length=2000)
    status: Status = "pendente"
    prioridade: Prioridade = "media"
    # `data` é aceita apenas como adaptação temporária ao frontend atual.
    data_registro: date | None = None
    data_conclusao: date | None = None
    responsavel_id: int | None = None
    valor: Decimal | None = Field(default=Decimal("0.00"), ge=0, max_digits=12, decimal_places=2)
    categoria_custo: CategoriaCusto | None = "outro"


class ManutencaoUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    espaco_id: int | None = None
    tipo: TipoManutencao | None = None
    descricao: str | None = Field(default=None, min_length=1, max_length=2000)
    status: Status | None = None
    prioridade: Prioridade | None = None
    data_registro: date | None = None
    data_conclusao: date | None = None
    responsavel_id: int | None = None
    valor: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    categoria_custo: CategoriaCusto | None = None


class LoginInput(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)
