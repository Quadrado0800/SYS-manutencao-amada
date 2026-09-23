from database import SessionLocal
from models import Pousada


db = SessionLocal()

try:
    pousada = db.query(Pousada).filter_by(
        slug="atlantic"
    ).first()

    print("Pousada:", pousada.nome)

    for espaco in pousada.espacos:
        print(
            "Espaço:",
            espaco.nome,
            "| Identificador:",
            espaco.identificador
        )

finally:
    db.close()