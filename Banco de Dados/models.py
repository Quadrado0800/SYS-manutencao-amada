from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from base import Base


class Pousada(Base):
    __tablename__ = "pousadas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    ativa: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    criada_em: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    atualizada_em: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


class Espaco(Base):
    __tablename__ = "espacos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    pousada_id: Mapped[int] = mapped_column(
        ForeignKey("pousadas.id"),
        nullable=False
    )

    nome: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    identificador: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    tipo: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    andar: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    ordem: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    ativo: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    criado_em: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )