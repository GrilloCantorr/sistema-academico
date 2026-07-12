from datetime import datetime
from app import db


class Pago(db.Model):
    __tablename__ = "pagos"

    id = db.Column(db.Integer, primary_key=True)
    matricula_id = db.Column(db.Integer, db.ForeignKey("matriculas.id"), nullable=False)
    numero_operacion = db.Column(db.String(50), nullable=False)
    fecha_pago = db.Column(db.Date, nullable=False)
    monto = db.Column(db.Numeric(10, 2), nullable=False)
    comprobante_ruta = db.Column(db.String(255))
    comprobante_nombre_original = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    matricula = db.relationship("Matricula", backref="pagos")