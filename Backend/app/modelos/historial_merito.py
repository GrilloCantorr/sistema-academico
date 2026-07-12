from datetime import datetime
from app import db


class HistorialMerito(db.Model):
    __tablename__ = "historial_meritos"

    id = db.Column(db.Integer, primary_key=True)
    estudiante_id = db.Column(db.Integer, db.ForeignKey("estudiantes.id"))
    periodo_academico_id = db.Column(db.Integer, db.ForeignKey("periodos_academicos.id"))
    semestre_id = db.Column(db.Integer, db.ForeignKey("semestres.id"))
    especialidad_id = db.Column(db.Integer, db.ForeignKey("especialidades.id"))

    promedio_ponderado_periodo = db.Column(db.Numeric(4, 2), nullable=False)
    creditos_matriculados_periodo = db.Column(db.SmallInteger, nullable=False)
    creditos_aprobados_periodo = db.Column(db.SmallInteger, nullable=False)

    orden_merito = db.Column(db.Integer, nullable=False)
    tipo_clasificacion_id = db.Column(
        db.Integer, db.ForeignKey("tipos_clasificaciones_merito.id"), nullable=False
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("estudiante_id", "periodo_academico_id"),
    )

    estudiante = db.relationship("Estudiante", backref="meritos")
    periodo_academico = db.relationship("PeriodoAcademico", backref="meritos")
    semestre = db.relationship("Semestre", backref="meritos")
    especialidad = db.relationship("Especialidad", backref="meritos")
    tipo_clasificacion = db.relationship("TipoClasificacionMerito", backref="meritos")