from app import db


class PreRequisito(db.Model):
    __tablename__ = "pre_requisitos"

    curso_dependiente_id = db.Column(
        db.Integer, db.ForeignKey("cursos.id"), primary_key=True
    )
    curso_requisito_id = db.Column(
        db.Integer, db.ForeignKey("cursos.id"), primary_key=True
    )
    created_at = db.Column(db.DateTime)

    curso_dependiente = db.relationship(
        "Curso", foreign_keys=[curso_dependiente_id], backref="requisitos"
    )
    curso_requisito = db.relationship(
        "Curso", foreign_keys=[curso_requisito_id], backref="es_requisito_de"
    )