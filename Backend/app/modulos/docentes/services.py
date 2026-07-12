from app import db, bcrypt
from app.modelos.docente import Docente
from app.modelos.usuario import Usuario


class DocenteService:

    @staticmethod
    def registrar_docente(data):
        username = data.get("username")
        password = data.get("password")
        nombres = data.get("nombres")
        apellido_paterno = data.get("apellido_paterno")
        apellido_materno = data.get("apellido_materno")
        dni = data.get("dni")
        correo_institucional = data.get("correo_institucional")

        if not all([username, password, nombres, apellido_paterno, apellido_materno, dni, correo_institucional]):
            return None, "Faltan campos requeridos"

        if Usuario.query.filter_by(username=username).first():
            return None, "El nombre de usuario ya está en uso"

        password_encriptado = bcrypt.generate_password_hash(password).decode("utf-8")
        usuario = Usuario(username=username, password=password_encriptado, rol="docente")
        db.session.add(usuario)
        db.session.flush()

        docente = Docente(
            usuario_id=usuario.id,
            nombres=nombres,
            apellido_paterno=apellido_paterno,
            apellido_materno=apellido_materno,
            dni=dni,
            correo_institucional=correo_institucional,
        )
        db.session.add(docente)
        db.session.commit()

        return {"mensaje": "Docente registrado correctamente", "docente_id": docente.id, "usuario_id": usuario.id}, None

    @staticmethod
    def actualizar_docente(id, data):
        docente = db.session.get(Docente, id)
        if not docente or docente.deleted_at is not None:
            return None, "Docente no encontrado"

        if "nombres" in data:
            docente.nombres = data["nombres"]
        if "apellido_paterno" in data:
            docente.apellido_paterno = data["apellido_paterno"]
        if "apellido_materno" in data:
            docente.apellido_materno = data["apellido_materno"]
        if "dni" in data:
            docente.dni = data["dni"]
        if "correo_institucional" in data:
            docente.correo_institucional = data["correo_institucional"]
        db.session.commit()
        return {"mensaje": "Docente actualizado correctamente"}, None
