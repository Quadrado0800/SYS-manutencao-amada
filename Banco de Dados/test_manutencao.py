from datetime import date
from decimal import Decimal

from database import SessionLocal
from models import Pousada, Espaco, Usuario, Manutencao


db = SessionLocal()

try:
    pousada = db.query(Pousada).filter_by(slug="atlantic").first()

    espaco = db.query(Espaco).filter_by(
        identificador="Q01",
        pousada_id=pousada.id
    ).first()

    usuario = db.query(Usuario).filter_by(
        email="teste@exemplo.com"
    ).first()

    manutencao = Manutencao(
        pousada_id=pousada.id,
        espaco_id=espaco.id,
        criado_por_id=usuario.id,
        responsavel_id=usuario.id,
        tipo="eletrica",
        descricao="Problema na iluminação do quarto.",
        status="pendente",
        prioridade="alta",
        data_registro=date(2026, 9, 18),
        valor=Decimal("150.00"),
        categoria_custo="material"
    )

    db.add(manutencao)
    db.commit()

    print("Manutenção cadastrada com sucesso!")
    print("ID:", manutencao.id)

finally:
    db.close()