from app import db


class PlanCursosSemestre(db.Model):
    __tablename__ = "plan_cursos_semestre"

    id = db.Column(db.Integer, primary_key=True)
    plan_estudios_id = db.Column(db.Integer, db.ForeignKey("plan_de_estudios.id"))
    semestre_id = db.Column(db.Integer, db.ForeignKey("semestres.id"))
    curso_id = db.Column(db.Integer, db.ForeignKey("cursos.id"))
    created_at = db.Column(db.DateTime)
    modified_at = db.Column(db.DateTime)
    deleted_at = db.Column(db.DateTime)

    __table_args__ = (
        db.UniqueConstraint("plan_estudios_id", "semestre_id", "curso_id"),
    )

    plan_estudios = db.relationship("PlanDeEstudios", backref="cursos_por_semestre")
    semestre = db.relationship("Semestre", backref="cursos_asignados")
    curso = db.relationship("Curso", backref="asignaciones")