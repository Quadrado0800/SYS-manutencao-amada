from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from base import Base


class Pousada(Base):
    __tablename__ = "pousadas"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    nome: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    slug: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True
    )

    ativa: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

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

    espacos: Mapped[list["Espaco"]] = relationship(
        back_populates="pousada"
    )

    vinculos_usuarios: Mapped[list["UsuarioPousada"]] = relationship(
        back_populates="pousada"
    )

    manutencoes: Mapped[list["Manutencao"]] = relationship(
        back_populates="pousada"
    )

    auditorias: Mapped[list["Auditoria"]] = relationship(
        back_populates="pousada"
    )

class Espaco(Base):
    __tablename__ = "espacos"

    __table_args__ = (
        UniqueConstraint(
            "pousada_id",
            "id",
            name="uq_espaco_pousada_id",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

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

    pousada: Mapped["Pousada"] = relationship(
        back_populates="espacos"
    )

    manutencoes: Mapped[list["Manutencao"]] = relationship(
        back_populates="espaco",
        foreign_keys="Manutencao.espaco_id"
    )

class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    nome: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        unique=True
    )

    senha_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
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

    vinculos_pousadas: Mapped[list["UsuarioPousada"]] = relationship(
        back_populates="usuario"
    )

    manutencoes_criadas: Mapped[list["Manutencao"]] = relationship(
        back_populates="criado_por",
        foreign_keys="Manutencao.criado_por_id"
    )

    manutencoes_responsavel: Mapped[list["Manutencao"]] = relationship(
        back_populates="responsavel",
        foreign_keys="Manutencao.responsavel_id"
    )

    auditorias: Mapped[list["Auditoria"]] = relationship(
        back_populates="usuario"
    )


class UsuarioPousada(Base):
    __tablename__ = "usuario_pousada"

    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id"),
        primary_key=True
    )

    pousada_id: Mapped[int] = mapped_column(
        ForeignKey("pousadas.id"),
        primary_key=True
    )

    papel: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    usuario: Mapped["Usuario"] = relationship(
        back_populates="vinculos_pousadas"
    )

    pousada: Mapped["Pousada"] = relationship(
        back_populates="vinculos_usuarios"
    )

class Manutencao(Base):
    __tablename__ = "manutencoes"

    __table_args__ = (
        CheckConstraint(
            "status IN ('pendente', 'em_andamento', 'concluido')",
            name="ck_manutencao_status"
        ),
        CheckConstraint(
            "tipo IN ('pintura', 'eletrica', 'hidraulica', 'limpeza', 'mobiliario', 'ocorrencia')",
            name="ck_manutencao_tipo"
        ),
        CheckConstraint(
            "prioridade IN ('alta', 'media', 'baixa')",
            name="ck_manutencao_prioridade"
        ),
        CheckConstraint(
            "categoria_custo IN ('material', 'mao_de_obra', 'equipamento', 'outro')",
            name="ck_manutencao_categoria_custo"
        ),
        ForeignKeyConstraint(
        ["pousada_id", "espaco_id"],
        ["espacos.pousada_id", "espacos.id"],
        name="fk_manutencao_espaco_pousada"
        ),

        ForeignKeyConstraint(
        ["criado_por_id", "pousada_id"],
        ["usuario_pousada.usuario_id", "usuario_pousada.pousada_id"],
        name="fk_manutencao_criador_pousada"
        ),

        ForeignKeyConstraint(
        ["responsavel_id", "pousada_id"],
        ["usuario_pousada.usuario_id", "usuario_pousada.pousada_id"],
        name="fk_manutencao_responsavel_pousada"
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    pousada_id: Mapped[int] = mapped_column(
        ForeignKey("pousadas.id"),
        nullable=False
    )

    espaco_id: Mapped[int] = mapped_column(
        ForeignKey("espacos.id"),
        nullable=False
    )

    criado_por_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=False
    )

    responsavel_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=True
    )

    tipo: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    descricao: Mapped[str] = mapped_column(
        String(1000),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pendente"
    )

    prioridade: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    data_registro: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    data_conclusao: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    valor: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True
    )

    categoria_custo: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
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
    pousada: Mapped["Pousada"] = relationship(
        back_populates="manutencoes"
    )

    espaco: Mapped["Espaco"] = relationship(
        back_populates="manutencoes",
        foreign_keys=[espaco_id]
    )

    criado_por: Mapped["Usuario"] = relationship(
        back_populates="manutencoes_criadas",
        foreign_keys=[criado_por_id]
    )

    responsavel: Mapped["Usuario | None"] = relationship(
        back_populates="manutencoes_responsavel",
        foreign_keys=[responsavel_id]
    )

    fotos: Mapped[list["Foto"]] = relationship(
        back_populates="manutencao"
    )
    
class Foto(Base):
    __tablename__ = "fotos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    manutencao_id: Mapped[int] = mapped_column(
        ForeignKey("manutencoes.id"),
        nullable=False
    )

    nome_arquivo: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    caminho: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    tamanho: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    criada_em: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    manutencao: Mapped["Manutencao"] = relationship(
        back_populates="fotos"
    )

class Auditoria(Base):
    __tablename__ = "auditorias"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    pousada_id: Mapped[int] = mapped_column(
        ForeignKey("pousadas.id"),
        nullable=False
    )

    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=False
    )

    entidade: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    entidade_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    acao: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    dados_anteriores: Mapped[str | None] = mapped_column(
        String(5000),
        nullable=True
    )

    dados_novos: Mapped[str | None] = mapped_column(
        String(5000),
        nullable=True
    )

    criado_em: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    pousada: Mapped["Pousada"] = relationship(
        back_populates="auditorias"
    )

    usuario: Mapped["Usuario"] = relationship(
        back_populates="auditorias"
    )