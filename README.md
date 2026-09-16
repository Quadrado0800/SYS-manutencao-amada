### Projeto de sistema para controle de manutenção de um grupo de pousadas

SISTEMA DE GESTÃO DE MANUTENÇÃO

Backend:
    FastAPI
    SQLAlchemy
    SQLite inicialmente

Arquitetura:
    Multi-pousada

Pousadas:
    Atlantic
    Flor de Magnólia
    Amada Terra

Entidades:
    Pousada
    Usuário
    UsuárioPousada
    Espaço
    Manutenção
    Foto
    Auditoria

Roles:
    ADMIN
    CHEFE
    MANUTENCAO

Frontend:
    HTML
    CSS
    JavaScript

Comunicação:
    REST API / JSON

Arquivos:
    Storage externo ao banco

Banco:
    Uma base central
    Dados isolados por pousada

Princípio:
    Frontend não acessa banco diretamente.
    Backend controla autenticação e autorização.
    Toda manutenção pertence a um espaço.
    Todo espaço pertence a uma pousada.