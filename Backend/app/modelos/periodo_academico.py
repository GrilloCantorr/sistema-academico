from app import db


class PeriodoAcademico(db.Model):
    __tablename__ = "periodos_academicos"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(10))
    fecha_inicio = db.Column(db.DateTime)
    fecha_fin = db.Column(db.DateTime)
    dias_limite_pago = db.Column(db.Integer, nullable=False, default=15)
    created_at = db.Column(db.DateTime)
    modified_at = db.Column(db.DateTime)
    deleted_at = db.Column(db.DateTime)