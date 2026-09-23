from base import Base
from database import engine
from models import Pousada


Base.metadata.create_all(bind=engine)

print("Tabelas criadas com sucesso!")