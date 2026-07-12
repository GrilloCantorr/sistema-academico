from app import db


class Docente(db.Model):
    __tablename__ = "docentes"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"))
    nombres = db.Column(db.String(150), nullable=False)
    apellido_paterno = db.Column(db.String(150), nullable=False)
    apellido_materno = db.Column(db.String(150), nullable=False)
    dni = db.Column(db.CHAR(8), nullable=False)
    correo_institucional = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime)
    modified_at = db.Column(db.DateTime)
    deleted_at = db.Column(db.DateTime)

    usuario = db.relationship("Usuario", backref="docente")