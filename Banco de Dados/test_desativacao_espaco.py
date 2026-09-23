from database import SessionLocal
from models import Espaco, Manutencao

db = SessionLocal()

try:
    manutencao = db.query(Manutencao).first()

    if manutencao is None:
        print("ERRO: não existe nenhuma manutenção para realizar o teste.")
    else:
        espaco = (
            db.query(Espaco)
            .filter_by(id=manutencao.espaco_id)
            .first()
        )

        print("Espaço:", espaco.nome)
        print("Ativo antes:", espaco.ativo)

        espaco.ativo = False

        db.commit()
        db.refresh(espaco)

        print("Ativo depois:", espaco.ativo)

        manutencao_atualizada = (
            db.query(Manutencao)
            .filter_by(id=manutencao.id)
            .first()
        )

        print("Manutenção ainda existe:", manutencao_atualizada is not None)
        print("Espaço da manutenção:", manutencao_atualizada.espaco_id)

finally:
    db.close()