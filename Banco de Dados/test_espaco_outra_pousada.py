from database import SessionLocal
from models import Pousada, Espaco


db = SessionLocal()

try:
    amada_terra = (
        db.query(Pousada)
        .filter_by(slug="amada-terra")
        .first()
    )

    espaco = Espaco(
        pousada_id=amada_terra.id,
        nome="Quarto 01",
        identificador="Q01",
        tipo="quarto",
        andar="1",
        ordem=1,
    )

    db.add(espaco)
    db.commit()

    print("Espaço da Amada Terra criado com sucesso.")

finally:
    db.close()