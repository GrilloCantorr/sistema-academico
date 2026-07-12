from app import db


class SeccionCurso(db.Model):
    __tablename__ = "secciones_curso"

    id = db.Column(db.Integer, primary_key=True)
    periodo_academico_id = db.Column(
        db.Integer, db.ForeignKey("periodos_academicos.id"), nullable=False
    )
    curso_id = db.Column(db.Integer, db.ForeignKey("cursos.id"), nullable=False)
    semestre_id = db.Column(db.Integer, db.ForeignKey("semestres.id"), nullable=False)
    cupos = db.Column(db.SmallInteger, default=40)

    __table_args__ = (
        db.UniqueConstraint("periodo_academico_id", "curso_id", "semestre_id"),
    )

    periodo_academico = db.relationship("PeriodoAcademico", backref="secciones_curso")
    curso = db.relationship("Curso", backref="secciones_curso")
    semestre = db.relationship("Semestre", backref="secciones_curso")
