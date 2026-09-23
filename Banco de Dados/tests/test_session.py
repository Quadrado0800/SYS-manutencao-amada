''' 
TESTE DE CRIAÇÃO DE POUSADA

from database import SessionLocal
from models import Pousada


db = SessionLocal()

try:
    pousada = Pousada(
        nome="Pousada Atlantic",
        slug="atlantic"
    )

    db.add(pousada)
    db.commit()

    print("Pousada cadastrada com sucesso!")

finally:
    db.close()
'''



from database import SessionLocal
from models import Pousada


db = SessionLocal()

try:
    pousadas = db.query(Pousada).all()

    for pousada in pousadas:
        print(
            pousada.id,
            pousada.nome,
            pousada.slug,
            pousada.ativa
        )

finally:
    db.close()