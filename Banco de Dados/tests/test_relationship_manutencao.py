from database import SessionLocal
from models import Manutencao


db = SessionLocal()

try:
    manutencao = db.query(Manutencao).filter_by(id=1).first()

    print("Manutenção:", manutencao.descricao)
    print("Pousada:", manutencao.pousada.nome)
    print("Espaço:", manutencao.espaco.nome)
    print("Criado por:", manutencao.criado_por.nome)
    print("Responsável:", manutencao.responsavel.nome)

finally:
    db.close()