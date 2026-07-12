from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from app import db
from app.modelos.docente import Docente
from app.modelos.usuario import Usuario
from app.modulos.docentes.services import DocenteService


def listar_docentes():
    docentes = Docente.query.filter(Docente.deleted_at.is_(None)).all()
    return jsonify([
        {
            "id": d.id,
            "usuario_id": d.usuario_id,
            "nombres": d.nombres,
            "apellido_paterno": d.apellido_paterno,
            "apellido_materno": d.apellido_materno,
            "dni": d.dni,
            "correo_institucional": d.correo_institucional,
        }
        for d in docentes
    ])


def obtener_docente(id):
    docente = db.session.get(Docente, id)
    if not docente or docente.deleted_at is not None:
        return jsonify({"error": "Docente no encontrado"}), 404
    return jsonify({
        "id": docente.id,
        "usuario_id": docente.usuario_id,
        "nombres": docente.nombres,
        "apellido_paterno": docente.apellido_paterno,
        "apellido_materno": docente.apellido_materno,
        "dni": docente.dni,
        "correo_institucional": docente.correo_institucional,
    })


def crear_docente():
    data = request.get_json()
    resultado, error = DocenteService.registrar_docente(data)
    if error:
        return jsonify({"error": error}), 400
    return jsonify(resultado), 201


def actualizar_docente(id):
    data = request.get_json()
    resultado, error = DocenteService.actualizar_docente(id, data)
    if error:
        return jsonify({"error": error}), 400
    return jsonify(resultado)
