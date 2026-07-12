from flask import jsonify, request
from app import db
from app.modelos.seccion_curso import SeccionCurso
from app.modulos.secciones_curso.services import SeccionCursoService


def listar_secciones():
    secciones = SeccionCurso.query.all()
    return jsonify([
        {
            "id": s.id,
            "periodo_academico_id": s.periodo_academico_id,
            "periodo_nombre": s.periodo_academico.nombre if s.periodo_academico else None,
            "curso_id": s.curso_id,
            "curso_nombre": s.curso.nombre if s.curso else None,
            "semestre_id": s.semestre_id,
            "semestre_codigo": s.semestre.codigo if s.semestre else None,
            "cupos": s.cupos,
        }
        for s in secciones
    ])


def obtener_seccion(id):
    seccion = db.session.get(SeccionCurso, id)
    if not seccion:
        return jsonify({"error": "Seccion no encontrada"}), 404
    return jsonify({
        "id": seccion.id,
        "periodo_academico_id": seccion.periodo_academico_id,
        "periodo_nombre": seccion.periodo_academico.nombre if seccion.periodo_academico else None,
        "curso_id": seccion.curso_id,
        "curso_nombre": seccion.curso.nombre if seccion.curso else None,
        "semestre_id": seccion.semestre_id,
        "cupos": seccion.cupos,
    })


def crear_seccion():
    data = request.get_json()
    resultado, error = SeccionCursoService.crear_seccion(data)
    if error:
        return jsonify({"error": error}), 400
    return jsonify(resultado), 201


def actualizar_seccion(id):
    data = request.get_json()
    resultado, error = SeccionCursoService.actualizar_seccion(id, data)
    if error:
        return jsonify({"error": error}), 400
    return jsonify(resultado)
