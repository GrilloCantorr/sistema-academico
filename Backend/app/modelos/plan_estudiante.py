from app import db


class PlanEstudiante(db.Model):
    __tablename__ = "plan_estudiantes"

    estudiante_id = db.Column(
        db.Integer, db.ForeignKey("estudiantes.id"), primary_key=True
    )
    plan_estudios_id = db.Column(
        db.Integer, db.ForeignKey("plan_de_estudios.id"), primary_key=True
    )
    created_at = db.Column(db.DateTime)
    modified_at = db.Column(db.DateTime)
    deleted_at = db.Column(db.DateTime)

    estudiante = db.relationship("Estudiante", backref="planes")
    plan_estudios = db.relationship("PlanDeEstudios", backref="estudiantes_asignados")