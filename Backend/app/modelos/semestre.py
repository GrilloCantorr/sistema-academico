from app import db


class Semestre(db.Model):
    __tablename__ = "semestres"

    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(2), nullable=False, unique=True)
    created_at = db.Column(db.DateTime)
    modified_at = db.Column(db.DateTime)
    deleted_at = db.Column(db.DateTime)