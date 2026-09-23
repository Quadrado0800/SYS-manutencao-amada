from datetime import date

from database import SessionLocal
from models import Manutencao


db = SessionLocal()

try:
    manutencao = db.query(Manutencao).filter_by(id=1).first()

    if manutencao is None:
        print("Manutenção não encontrada.")
    else:
        manutencao.status = "concluido"
        manutencao.data_conclusao = date(2026, 9, 20)

        db.commit()

        print("Manutenção concluída com sucesso!")
        print("Status:", manutencao.status)
        print("Data de registro:", manutencao.data_registro)
        print("Data de conclusão:", manutencao.data_conclusao)

finally:
    db.close()