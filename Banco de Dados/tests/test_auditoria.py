from database import SessionLocal
from models import Auditoria, Pousada, Usuario

db = SessionLocal()

try:
    pousada = db.query(Pousada).filter_by(slug="atlantic").first()
    usuario = db.query(Usuario).filter_by(email="teste@exemplo.com").first()

    auditoria = Auditoria(
        pousada_id=pousada.id,
        usuario_id=usuario.id,
        entidade="manutencao",
        entidade_id=1,
        acao="criacao",
        dados_anteriores=None,
        dados_novos='{"status": "pendente"}',
    )

    db.add(auditoria)
    db.commit()
    db.refresh(auditoria)

    print("Auditoria criada com sucesso.")
    print("ID:", auditoria.id)
    print("Entidade:", auditoria.entidade)
    print("Ação:", auditoria.acao)

finally:
    db.close()