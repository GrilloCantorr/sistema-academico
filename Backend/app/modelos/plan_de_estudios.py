from app import db


class PlanDeEstudios(db.Model):
    __tablename__ = "plan_de_estudios"

    id = db.Column(db.Integer, primary_key=True)
    especialidad_id = db.Column(db.Integer, db.ForeignKey("especialidades.id"))
    anio_creacion = db.Column(db.Integer, nullable=False)
    vigente = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime)
    modified_at = db.Column(db.DateTime)
    deleted_at = db.Column(db.DateTime)

    especialidad = db.relationship("Especialidad", backref="planes_de_estudio")