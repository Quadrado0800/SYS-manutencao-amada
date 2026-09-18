"""Dados iniciais, deliberadamente mantidos apenas em memória."""
from copy import deepcopy

NOW = "2026-09-18T09:00:00"

INITIAL_DATA = {
    "pousadas": [
        {"id": 1, "nome": "Pousada Atlantic", "slug": "atlantic", "ativa": True, "criada_em": "2026-01-10T08:00:00", "atualizada_em": NOW},
        {"id": 2, "nome": "Pousada Flor de Magnólia", "slug": "flor-de-magnolia", "ativa": True, "criada_em": "2026-02-03T08:00:00", "atualizada_em": NOW},
        {"id": 3, "nome": "Pousada Amada Terra", "slug": "amada-terra", "ativa": True, "criada_em": "2026-03-21T08:00:00", "atualizada_em": NOW},
    ],
    "usuarios": [
        {"id": 1, "nome": "Ana Ribeiro", "username": "admin", "email": "ana@mock.local", "ativo": True, "criado_em": NOW, "atualizado_em": NOW},
        {"id": 2, "nome": "Marina Costa", "username": "chefe", "email": "marina@mock.local", "ativo": True, "criado_em": NOW, "atualizado_em": NOW},
        {"id": 7, "nome": "Carlos Silva", "username": "carlos", "email": "carlos@mock.local", "ativo": True, "criado_em": NOW, "atualizado_em": NOW},
        {"id": 8, "nome": "João Santos", "username": "joao", "email": "joao@mock.local", "ativo": True, "criado_em": NOW, "atualizado_em": NOW},
        {"id": 9, "nome": "Lúcia Alves", "username": "lucia", "email": "lucia@mock.local", "ativo": True, "criado_em": NOW, "atualizado_em": NOW},
        {"id": 10, "nome": "Pedro Lima", "username": "pedro", "email": "pedro@mock.local", "ativo": False, "criado_em": NOW, "atualizado_em": NOW},
        {"id": 11, "nome": "Rita Nunes", "username": "rita", "email": "rita@mock.local", "ativo": True, "criado_em": NOW, "atualizado_em": NOW},
    ],
    "vinculos": [
        {"usuario_id": 1, "pousada_id": 1, "papel": "ADMIN"}, {"usuario_id": 1, "pousada_id": 2, "papel": "ADMIN"}, {"usuario_id": 1, "pousada_id": 3, "papel": "ADMIN"},
        {"usuario_id": 2, "pousada_id": 1, "papel": "CHEFE"}, {"usuario_id": 2, "pousada_id": 3, "papel": "CHEFE"},
        {"usuario_id": 7, "pousada_id": 1, "papel": "MANUTENCAO"}, {"usuario_id": 8, "pousada_id": 1, "papel": "MANUTENCAO"},
        {"usuario_id": 9, "pousada_id": 2, "papel": "MANUTENCAO"}, {"usuario_id": 10, "pousada_id": 1, "papel": "MANUTENCAO"},
        {"usuario_id": 11, "pousada_id": 3, "papel": "MANUTENCAO"},
    ],
    "espacos": [
        {"id": 10, "pousada_id": 1, "nome": "Suíte 101", "identificador": "101", "tipo": "apartamento", "andar": "1º andar", "ordem": 1, "ativo": True, "criado_em": NOW, "atualizado_em": NOW},
        {"id": 11, "pousada_id": 1, "nome": "Recepção", "identificador": "REC", "tipo": "recepcao", "andar": "Térreo", "ordem": 2, "ativo": True, "criado_em": NOW, "atualizado_em": NOW},
        {"id": 12, "pousada_id": 1, "nome": "Piscina", "identificador": "PISC", "tipo": "piscina", "andar": "Área externa", "ordem": 3, "ativo": True, "criado_em": NOW, "atualizado_em": NOW},
        {"id": 20, "pousada_id": 2, "nome": "Chalé Ipê", "identificador": "CH-1", "tipo": "chalé", "andar": "Jardim", "ordem": 1, "ativo": True, "criado_em": NOW, "atualizado_em": NOW},
        {"id": 21, "pousada_id": 2, "nome": "Cozinha Principal", "identificador": "COZ", "tipo": "cozinha", "andar": "Térreo", "ordem": 2, "ativo": True, "criado_em": NOW, "atualizado_em": NOW},
        {"id": 30, "pousada_id": 3, "nome": "Restaurante Terra", "identificador": "REST", "tipo": "restaurante", "andar": "Térreo", "ordem": 1, "ativo": True, "criado_em": NOW, "atualizado_em": NOW},
        {"id": 31, "pousada_id": 3, "nome": "Trilha das Palmeiras", "identificador": "TR-1", "tipo": "area_externa", "andar": "Exterior", "ordem": 2, "ativo": True, "criado_em": NOW, "atualizado_em": NOW},
    ],
    "manutencoes": [
        {"id": 101, "pousada_id": 1, "espaco_id": 10, "criado_por_id": 1, "responsavel_id": None, "tipo": "hidraulica", "descricao": "Vazamento no banheiro.", "status": "pendente", "prioridade": "alta", "data_registro": "2026-09-18", "data_conclusao": None, "valor": "0.00", "categoria_custo": "material", "criado_em": NOW, "atualizado_em": NOW},
        {"id": 102, "pousada_id": 1, "espaco_id": 11, "criado_por_id": 1, "responsavel_id": 7, "tipo": "eletrica", "descricao": "Trocar luminária da recepção.", "status": "em_andamento", "prioridade": "media", "data_registro": "2026-09-16", "data_conclusao": None, "valor": "85.50", "categoria_custo": "material", "criado_em": NOW, "atualizado_em": NOW},
        {"id": 103, "pousada_id": 1, "espaco_id": 12, "criado_por_id": 2, "responsavel_id": 10, "tipo": "limpeza", "descricao": "Limpeza técnica do filtro.", "status": "concluido", "prioridade": "baixa", "data_registro": "2026-09-12", "data_conclusao": "2026-09-14", "valor": "150.00", "categoria_custo": "mao_de_obra", "criado_em": NOW, "atualizado_em": NOW},
        {"id": 201, "pousada_id": 2, "espaco_id": 20, "criado_por_id": 1, "responsavel_id": 9, "tipo": "pintura", "descricao": "Reparar pintura externa.", "status": "pendente", "prioridade": "media", "data_registro": "2026-09-17", "data_conclusao": None, "valor": "320.00", "categoria_custo": "material", "criado_em": NOW, "atualizado_em": NOW},
        {"id": 301, "pousada_id": 3, "espaco_id": 30, "criado_por_id": 2, "responsavel_id": 11, "tipo": "mobiliario", "descricao": "Ajustar mesa do restaurante.", "status": "concluido", "prioridade": "alta", "data_registro": "2026-09-10", "data_conclusao": "2026-09-11", "valor": "210.00", "categoria_custo": "equipamento", "criado_em": NOW, "atualizado_em": NOW},
    ],
    "fotos": [{"id": 1, "manutencao_id": 102, "nome_arquivo": "luminaria.jpg", "caminho": "/mock/uploads/luminaria.jpg", "tamanho": 245678, "mime_type": "image/jpeg", "criada_em": NOW}],
    "auditoria": [{"id": 1, "pousada_id": 1, "usuario_id": 1, "entidade": "manutencao", "entidade_id": 102, "acao": "atualizacao", "dados_anteriores": {"status": "pendente", "responsavel_id": None}, "dados_novos": {"status": "em_andamento", "responsavel_id": 7}, "criado_em": "2026-09-18T08:30:00"}],
}


def fresh_data():
    return deepcopy(INITIAL_DATA)
