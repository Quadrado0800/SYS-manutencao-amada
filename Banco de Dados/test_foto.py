from database import SessionLocal
from models import Foto, Manutencao

db = SessionLocal()

try:
    manutencao = db.query(Manutencao).first()

    foto = Foto(
        manutencao_id=manutencao.id,
        nome_arquivo="teste.jpg",
        caminho="fotos/teste.jpg",
        tamanho=12345,
        mime_type="image/jpeg",
    )

    db.add(foto)
    db.commit()
    db.refresh(foto)

    print("Foto criada com sucesso.")
    print("ID:", foto.id)
    print("Arquivo:", foto.nome_arquivo)
    print("Caminho:", foto.caminho)

finally:
    db.close()