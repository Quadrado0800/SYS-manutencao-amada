from database import SessionLocal
from models import Pousada


pousadas_iniciais = [
    {
        "nome": "Pousada Atlantic",
        "slug": "atlantic"
    },
    {
        "nome": "Flor de Magnólia",
        "slug": "flor-de-magnolia"
    },
    {
        "nome": "Amada Terra",
        "slug": "amada-terra"
    }
]


db = SessionLocal()

try:
    for dados in pousadas_iniciais:
        pousada = (
            db.query(Pousada)
            .filter_by(slug=dados["slug"])
            .first()
        )

        if pousada is None:
            pousada = Pousada(**dados)
            db.add(pousada)

    db.commit()

    print("Seed executado com sucesso!")

finally:
    db.close()