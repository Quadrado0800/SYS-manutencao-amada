from database import SessionLocal
from models import Usuario

db = SessionLocal()

try:
    usuario = db.query(Usuario).filter_by(email="teste@exemplo.com").first()

    if usuario is None:
        print("ERRO: usuário não encontrado.")
    else:
        print("Usuário:", usuario.nome)
        print("Ativo antes:", usuario.ativo)

        usuario.ativo = False

        db.commit()
        db.refresh(usuario)

        print("Ativo depois:", usuario.ativo)

finally:
    db.close()