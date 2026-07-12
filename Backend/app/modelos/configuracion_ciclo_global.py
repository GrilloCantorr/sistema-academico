from datetime import datetime
from app import db


class ConfiguracionCicloGlobal(db.Model):
    __tablename__ = "configuracion_ciclo_global"

    id = db.Column(db.Integer, primary_key=True)
    periodo_academico_id = db.Column(db.Integer, db.ForeignKey("periodos_academicos.id"))
    estado_ciclo = db.Column(db.String(60), default="Planificacion Horaria")
    fecha_cierre_matricula = db.Column(db.DateTime)
    fecha_limite_notas = db.Column(db.DateTime)
    fecha_cierre_actas = db.Column(db.DateTime)
    actualizado_en = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    periodo_academico = db.relationship("PeriodoAcademico")
