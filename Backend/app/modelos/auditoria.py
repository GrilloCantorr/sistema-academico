from datetime import datetime
from app import db


class Auditoria(db.Model):
    __tablename__ = "auditorias"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"))
    accion = db.Column(db.String(150), nullable=False)
    detalle = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    usuario = db.relationship("Usuario", backref="auditorias")

    @classmethod
    def registrar(cls, usuario_id, accion, detalle):
        registro = cls(
            usuario_id=usuario_id,
            accion=accion,
            detalle=detalle,
        )
        db.session.add(registro)
        return registro