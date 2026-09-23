from database import SessionLocal
from models import Pousada, Usuario, UsuarioPousada


db = SessionLocal()

try:
    pousada_atlantic = db.query(Pousada).filter_by(
        slug="atlantic"
    ).first()

    pousada_amada = db.query(Pousada).filter_by(
        slug="amada-terra"
    ).first()

    usuario = Usuario(
        nome="Usuário Teste",
        email="teste@exemplo.com",
        senha_hash="hash_de_teste"
    )

    db.add(usuario)
    db.flush()

    vinculo_atlantic = UsuarioPousada(
        usuario_id=usuario.id,
        pousada_id=pousada_atlantic.id,
        papel="MANUTENCAO"
    )

    vinculo_amada = UsuarioPousada(
        usuario_id=usuario.id,
        pousada_id=pousada_amada.id,
        papel="CHEFE"
    )

    db.add(vinculo_atlantic)
    db.add(vinculo_amada)

    db.commit()

    print("Usuário e vínculos cadastrados com sucesso!")

finally:
    db.close()