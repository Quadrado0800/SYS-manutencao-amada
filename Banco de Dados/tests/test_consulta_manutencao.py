from database import SessionLocal
from models import Manutencao


db = SessionLocal()

try:
    manutencoes = db.query(Manutencao).all()

    for manutencao in manutencoes:
        print("ID:", manutencao.id)
        print("Pousada ID:", manutencao.pousada_id)
        print("Espaço ID:", manutencao.espaco_id)
        print("Criado por ID:", manutencao.criado_por_id)
        print("Responsável ID:", manutencao.responsavel_id)
        print("Tipo:", manutencao.tipo)
        print("Descrição:", manutencao.descricao)
        print("Status:", manutencao.status)
        print("Prioridade:", manutencao.prioridade)
        print("Data de registro:", manutencao.data_registro)
        print("Data de conclusão:", manutencao.data_conclusao)
        print("Valor:", manutencao.valor)
        print("Categoria:", manutencao.categoria_custo)
        print("Criado em:", manutencao.criado_em)
        print("Atualizado em:", manutencao.atualizado_em)
        print("-" * 40)

finally:
    db.close()