from database import SessionLocal
from models import Pousada, Espaco


db = SessionLocal()

try:
    pousada = db.query(Pousada).filter_by(
        slug="atlantic"
    ).first()

    espaco = Espaco(
        pousada_id=pousada.id,
        nome="Quarto 01",
        identificador="Q01",
        tipo="quarto",
        andar="1",
        ordem=1
    )

    db.add(espaco)
    db.commit()

    print("Espaço cadastrado com sucesso!")

finally:
    db.close()