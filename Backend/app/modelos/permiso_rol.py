from datetime import datetime
from app import db


class PermisoRol(db.Model):
    __tablename__ = "permisos_rol"

    id = db.Column(db.Integer, primary_key=True)
    rol = db.Column(db.String(20), nullable=False)
    recurso = db.Column(db.String(50), nullable=False)
    puede_crear = db.Column(db.Boolean, nullable=False, default=False)
    puede_leer = db.Column(db.Boolean, nullable=False, default=False)
    puede_actualizar = db.Column(db.Boolean, nullable=False, default=False)
    puede_eliminar = db.Column(db.Boolean, nullable=False, default=False)
    puede_ejecutar_batch = db.Column(db.Boolean, nullable=False, default=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("rol", "recurso", name="uq_permisos_rol_recurso"),
    )
