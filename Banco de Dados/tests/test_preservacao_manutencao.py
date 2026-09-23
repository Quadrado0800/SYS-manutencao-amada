from database import SessionLocal
from models import Manutencao

db = SessionLocal()

try:
    manutencao = db.query(Manutencao).first()

    if manutencao is None:
        print("ERRO: manutenção não encontrada.")
    else:
        manutencao_id = manutencao.id

        print("Manutenção encontrada:", manutencao_id)

        db.expire_all()

        manutencao_verificada = (
            db.query(Manutencao)
            .filter_by(id=manutencao_id)
            .first()
        )

        print(
            "Manutenção preservada:",
            manutencao_verificada is not None
        )

finally:
    db.close()