from app import db


class Acta(db.Model):
    __tablename__ = "actas"

    id = db.Column(db.Integer, primary_key=True)
    seccion_curso_id = db.Column(
        db.Integer, db.ForeignKey("secciones_curso.id"), nullable=False, unique=True
    )
    estado = db.Column(db.String(20), nullable=False, default="Abierta")
    notas_publicadas = db.Column(db.Boolean, nullable=False, default=False)
    hash_auditoria = db.Column(db.String(64))
    fecha_cierre = db.Column(db.DateTime)

    seccion_curso = db.relationship("SeccionCurso", backref="acta", uselist=False)