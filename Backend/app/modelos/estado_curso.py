from app import db


class EstadoCurso(db.Model):
    __tablename__ = "estados_cursos"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(30))
    created_at = db.Column(db.DateTime)
    modified_at = db.Column(db.DateTime)
    deleted_at = db.Column(db.DateTime)