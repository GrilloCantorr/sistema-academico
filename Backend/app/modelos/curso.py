from app import db


class Curso(db.Model):
    __tablename__ = "cursos"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    codigo = db.Column(db.String(20), nullable=False, unique=True)
    creditos = db.Column(db.SmallInteger, nullable=False)
    horas_lectivas = db.Column(db.SmallInteger, nullable=False)
    horas_practicas = db.Column(db.SmallInteger, nullable=False)
    created_at = db.Column(db.DateTime)
    modified_at = db.Column(db.DateTime)
    deleted_at = db.Column(db.DateTime)