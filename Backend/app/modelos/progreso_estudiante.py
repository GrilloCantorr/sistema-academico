from datetime import datetime
from app import db


class ProgresoEstudiante(db.Model):
    __tablename__ = "progreso_estudiante"

    estudiante_id = db.Column(
        db.Integer, db.ForeignKey("estudiantes.id"), primary_key=True
    )
    estado_permanencia_id = db.Column(
        db.Integer, db.ForeignKey("estados_permanencia_estudiante.id"), nullable=False
    )
    creditos_aprobados_acumulados = db.Column(db.SmallInteger, nullable=False)
    promedio_ponderado_acumulado = db.Column(db.Numeric(4, 2), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    estudiante = db.relationship("Estudiante", backref="progreso", uselist=False)
    estado_permanencia = db.relationship("EstadoPermanenciaEstudiante", backref="estudiantes")