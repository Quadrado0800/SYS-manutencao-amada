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
        print("Manutenção:", manutencao.id)

        db.delete(espaco)
        db.commit()

        print("ATENÇÃO: o espaço foi excluído.")
        print("A FK NÃO impediu a exclusão.")

except Exception as erro:
    db.rollback()

    print("Exclusão bloqueada pelo banco.")
    print("Tipo do erro:", type(erro).__name__)
    print("Mensagem:", erro)

finally:
    db.close()