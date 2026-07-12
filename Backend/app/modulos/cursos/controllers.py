from flask import jsonify, request
from app import db
from app.modelos.curso import Curso
from app.modulos.cursos.services import CursoService


def listar_cursos():
    cursos = Curso.query.filter(Curso.deleted_at.is_(None)).all()
    return jsonify([
        {
            "id": c.id,
            "nombre": c.nombre,
            "codigo": c.codigo,
            "creditos": c.creditos,
            "horas_lectivas": c.horas_lectivas,
            "horas_practicas": c.horas_practicas,
        }
        for c in cursos
    ])


def obtener_curso(id):
    curso = db.session.get(Curso, id)
    if not curso or curso.deleted_at is not None:
        return jsonify({"error": "Curso no encontrado"}), 404
    return jsonify({
        "id": curso.id,
        "nombre": curso.nombre,
        "codigo": curso.codigo,
        "creditos": curso.creditos,
        "horas_lectivas": curso.horas_lectivas,
        "horas_practicas": curso.horas_practicas,
    })


def crear_curso():
    data = request.get_json()
    resultado, error = CursoService.crear_curso(data)
    if error:
        return jsonify({"error": error}), 400
    return jsonify(resultado), 201


def actualizar_curso(id):
    data = request.get_json()
    resultado, error = CursoService.actualizar_curso(id, data)
    if error:
        return jsonify({"error": error}), 400
    return jsonify(resultado)
