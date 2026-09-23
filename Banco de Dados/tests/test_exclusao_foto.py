from database import SessionLocal
from models import Foto

db = SessionLocal()

try:
    foto = db.query(Foto).first()

    if foto is None:
        print("ERRO: nenhuma foto encontrada.")
    else:
        foto_id = foto.id

        print("Foto encontrada:", foto_id)
        print("Arquivo:", foto.nome_arquivo)

        db.delete(foto)
        db.commit()

        foto_verificada = (
            db.query(Foto)
            .filter_by(id=foto_id)
            .first()
        )

        print(
            "Registro da foto excluído:",
            foto_verificada is None
        )

finally:
    db.close()