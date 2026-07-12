from app import db


class Estudiante(db.Model):
    __tablename__ = "estudiantes"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"))
    especialidad_id = db.Column(db.Integer, db.ForeignKey("especialidades.id"))
    nombres = db.Column(db.String(150), nullable=False)
    apellido_paterno = db.Column(db.String(150), nullable=False)
    apellido_materno = db.Column(db.String(150), nullable=False)
    dni = db.Column(db.CHAR(8), nullable=False)
    correo_institucional = db.Column(db.String(100), nullable=False)
    tiene_deuda_activa = db.Column(db.Boolean, nullable=False, default=False)
    tiene_sancion_activa = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime)
    modified_at = db.Column(db.DateTime)
    deleted_at = db.Column(db.DateTime)

    usuario = db.relationship("Usuario", backref="estudiante")
    especialidad = db.relationship("Especialidad", backref="estudiantes")