### System design for a maintenance control system for an inn group

MAINTENANCE MANAGEMENT SYSTEM

Backend:
    FastAPI
    SQLAlchemy
    SQLite initially

Architecture:
    Multi-inn

Inns:
    Atlantic
    Flor de Magnólia
    Amada Terra

Entities:
    Inn
    User
    UserInn
    Space
    Maintenance
    Photo
    Audit

Roles:
    ADMIN
    CHIEF
    MAINTENANCE

Frontend:
    HTML
    CSS
    JavaScript

Communication:
    REST API / JSON

Files:
    External storage (outside the database)

Database:
    Single central database
    Data isolated per inn

Principles:
    Frontend does not access the database directly.
    Backend controls authentication and authorization.
    Every maintenance item belongs to a space.
    Every space belongs to an inn.