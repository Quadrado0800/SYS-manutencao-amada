from datetime import date

from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models import Manutencao, Pousada, Espaco, Usuario


db = SessionLocal()

try:
    atlantic = (
        db.query(Pousada)
        .filter_by(slug="atlantic")
        .first()
    )

    amada_terra = (
        db.query(Pousada)
        .filter_by(slug="amada-terra")
        .first()
    )

    usuario_teste = (
        db.query(Usuario)
        .filter_by(email="teste@exemplo.com")
        .first()
    )

    espaco_atlantic = (
        db.query(Espaco)
        .filter_by(pousada_id=atlantic.id)
        .first()
    )

    espaco_amada_terra = (
        db.query(Espaco)
        .filter_by(pousada_id=amada_terra.id)
        .first()
    )

    usuario_outro = (
        db.query(Usuario)
        .filter_by(email="outra.pousada@exemplo.com")
        .first()
    )

    if usuario_outro is None:
        usuario_outro = Usuario(
            nome="Usuário de Outra Pousada",
            email="outra.pousada@exemplo.com",
            senha_hash="hash_de_teste",
        )

        db.add(usuario_outro)
        db.commit()
        db.refresh(usuario_outro)

    # --------------------------------------------------
    # TESTE 1: espaço de outra pousada
    # --------------------------------------------------

    tentativa = Manutencao(
        pousada_id=atlantic.id,
        espaco_id=espaco_amada_terra.id,
        criado_por_id=usuario_teste.id,
        responsavel_id=usuario_teste.id,
        tipo="eletrica",
        descricao="Teste de espaço de outra pousada",
        status="pendente",
        prioridade="alta",
        data_registro=date(2026, 9, 22),
    )

    db.add(tentativa)

    try:
        db.commit()
        print("ERRO: banco aceitou espaço de outra pousada.")
    except IntegrityError:
        db.rollback()
        print("OK: banco bloqueou espaço de outra pousada.")

    # --------------------------------------------------
    # TESTE 2: criador sem vínculo
    # --------------------------------------------------

    tentativa = Manutencao(
        pousada_id=atlantic.id,
        espaco_id=espaco_atlantic.id,
        criado_por_id=usuario_outro.id,
        responsavel_id=None,
        tipo="eletrica",
        descricao="Teste de criador sem vínculo",
        status="pendente",
        prioridade="alta",
        data_registro=date(2026, 9, 22),
    )

    db.add(tentativa)

    try:
        db.commit()
        print("ERRO: banco aceitou criador sem vínculo.")
    except IntegrityError:
        db.rollback()
        print("OK: banco bloqueou criador sem vínculo.")

    # --------------------------------------------------
    # TESTE 3: responsável sem vínculo
    # --------------------------------------------------

    tentativa = Manutencao(
        pousada_id=atlantic.id,
        espaco_id=espaco_atlantic.id,
        criado_por_id=usuario_teste.id,
        responsavel_id=usuario_outro.id,
        tipo="eletrica",
        descricao="Teste de responsável sem vínculo",
        status="pendente",
        prioridade="alta",
        data_registro=date(2026, 9, 22),
    )

    db.add(tentativa)

    try:
        db.commit()
        print("ERRO: banco aceitou responsável sem vínculo.")
    except IntegrityError:
        db.rollback()
        print("OK: banco bloqueou responsável sem vínculo.")

finally:
    db.close()