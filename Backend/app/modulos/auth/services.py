from app import db, bcrypt
from app.modelos.usuario import Usuario
from app.modelos.estudiante import Estudiante


class AuthService:

    @staticmethod
    def registrar_estudiante(username, password, nombres, apellido_paterno, apellido_materno, correo_institucional, especialidad_id):
        if Usuario.query.filter_by(username=username).first():
            return None, "El nombre de usuario ya está en uso"

        password_encriptado = bcrypt.generate_password_hash(password).decode("utf-8")

        usuario = Usuario(username=username, password=password_encriptado, rol="estudiante")
        db.session.add(usuario)
        db.session.flush()

        estudiante = Estudiante(
            usuario_id=usuario.id,
            especialidad_id=especialidad_id,
            nombres=nombres,
            apellido_paterno=apellido_paterno,
            apellido_materno=apellido_materno,
            correo_institucional=correo_institucional
        )
        db.session.add(estudiante)
        db.session.commit()

        return {"usuario_id": usuario.id, "estudiante_id": estudiante.id}, None