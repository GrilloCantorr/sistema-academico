import uuid
from datetime import datetime
from app import db


class Certificado(db.Model):
    __tablename__ = "certificados"

    id = db.Column(db.Integer, primary_key=True)
    estudiante_id = db.Column(db.Integer, db.ForeignKey("estudiantes.id"), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    ticket_codigo = db.Column(db.String(20), unique=True)
    estado = db.Column(db.String(50), nullable=False, default="Pendiente de Validación")
    comprobante_pago_ruta = db.Column(db.String(255))
    motivo_rechazo = db.Column(db.Text)
    hash_documento = db.Column(db.String(64))
    fecha_firma = db.Column(db.DateTime)
    codigo_verificacion = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    notificado_en = db.Column(db.DateTime)
    notificado_asunto = db.Column(db.String(150))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    estudiante = db.relationship("Estudiante", backref="certificados")