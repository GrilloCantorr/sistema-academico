from app import db


class Matricula(db.Model):
    __tablename__ = "matriculas"

    id = db.Column(db.Integer, primary_key=True)
    estudiante_id = db.Column(db.Integer, db.ForeignKey("estudiantes.id"))
    periodo_academico_id = db.Column(db.Integer, db.ForeignKey("periodos_academicos.id"))
    semestre_id = db.Column(db.Integer, db.ForeignKey("semestres.id"))
    estado_id = db.Column(db.Integer, db.ForeignKey("estados_matriculas.id"))
    pagado = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime)
    modified_at = db.Column(db.DateTime)
    deleted_at = db.Column(db.DateTime)

    estudiante = db.relationship("Estudiante", backref="matriculas")
    periodo_academico = db.relationship("PeriodoAcademico", backref="matriculas")
    semestre = db.relationship("Semestre", backref="matriculas")
    estado = db.relationship("EstadoMatricula", backref="matriculas")