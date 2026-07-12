from datetime import datetime
from flask import jsonify, request
from flask_jwt_extended import create_access_token
from app import db, bcrypt
from app.modelos.usuario import Usuario
from app.modulos.auth.services import AuthService


def login():
    datos = request.get_json()
    username = datos.get("username")
    password = datos.get("password")
    usuario = Usuario.query.filter_by(username=username, deleted_at=None).first()

    if not usuario:
        usuario_inactivo = Usuario.query.filter_by(username=username).filter(Usuario.deleted_at.isnot(None)).first()
        if usuario_inactivo:
            return jsonify({"error": "Usuario inactivo. Contacte al administrador."}), 403
        return jsonify({"error": "Credenciales inválidas"}), 401

    if not bcrypt.check_password_hash(usuario.password, password):
        return jsonify({"error": "Credenciales inválidas"}), 401

    usuario.modified_at = datetime.now()
    db.session.commit()

    token = create_access_token(
        identity=str(usuario.id),
        additional_claims={"rol": usuario.rol, "username": usuario.username},
    )
    return jsonify({
        "token": token,
        "usuario": {
            "id": usuario.id,
            "username": usuario.username,
            "rol": usuario.rol,
        },
    })


def registrar():
    datos = request.get_json()

    campos_requeridos = ["username", "password", "nombres", "apellido_paterno", "apellido_materno", "correo_institucional", "especialidad_id"]
    faltantes = [campo for campo in campos_requeridos if not datos.get(campo)]

    if faltantes:
        return jsonify({"error": f"Faltan campos requeridos: {faltantes}"}), 400

    resultado, error = AuthService.registrar_estudiante(
        username=datos.get("username"),
        password=datos.get("password"),
        nombres=datos.get("nombres"),
        apellido_paterno=datos.get("apellido_paterno"),
        apellido_materno=datos.get("apellido_materno"),
        correo_institucional=datos.get("correo_institucional"),
        especialidad_id=datos.get("especialidad_id")
    )

    if error:
        return jsonify({"error": error}), 400

    return jsonify({"mensaje": "Estudiante registrado correctamente", **resultado}), 201