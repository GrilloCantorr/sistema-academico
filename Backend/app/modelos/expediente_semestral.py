from datetime import datetime
from app import db


class ExpedienteSemestral(db.Model):
    __tablename__ = "expediente_semestral"

    id = db.Column(db.Integer, primary_key=True)
    estudiante_id = db.Column(db.Integer, db.ForeignKey("estudiantes.id"), nullable=False)
    periodo_academico_id = db.Column(db.Integer, db.ForeignKey("periodos_academicos.id"), nullable=False)
    promedio_ponderado_semestral = db.Column(db.Numeric(4, 2), nullable=False)
    creditos_aprobados_semestre = db.Column(db.SmallInteger, nullable=False)
    estado = db.Column(db.String(20), nullable=False, default="Consolidado")
    fecha_consolidacion = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("estudiante_id", "periodo_academico_id"),
    )

    estudiante = db.relationship("Estudiante", backref="expedientes_semestrales")
    periodo_academico = db.relationship("PeriodoAcademico", backref="expedientes_semestrales")