from flask import jsonify, request
from app import db
from app.modelos.periodo_academico import PeriodoAcademico
from app.modulos.periodos_academicos.services import PeriodoAcademicoService


def listar_periodos():
    periodos = PeriodoAcademico.query.order_by(PeriodoAcademico.fecha_inicio.desc()).all()
    return jsonify([
        {
            "id": p.id,
            "nombre": p.nombre,
            "fecha_inicio": p.fecha_inicio.isoformat() if p.fecha_inicio else None,
            "fecha_fin": p.fecha_fin.isoformat() if p.fecha_fin else None,
            "dias_limite_pago": p.dias_limite_pago,
        }
        for p in periodos
    ])


def obtener_periodo(id):
    periodo = db.session.get(PeriodoAcademico, id)
    if not periodo:
        return jsonify({"error": "Periodo académico no encontrado"}), 404
    return jsonify({
        "id": periodo.id,
        "nombre": periodo.nombre,
        "fecha_inicio": periodo.fecha_inicio.isoformat() if periodo.fecha_inicio else None,
        "fecha_fin": periodo.fecha_fin.isoformat() if periodo.fecha_fin else None,
        "dias_limite_pago": periodo.dias_limite_pago,
    })


def crear_periodo():
    data = request.get_json()
    resultado, error = PeriodoAcademicoService.crear_periodo(data)
    if error:
        return jsonify({"error": error}), 400
    return jsonify(resultado), 201


def actualizar_periodo(id):
    data = request.get_json()
    resultado, error = PeriodoAcademicoService.actualizar_periodo(id, data)
    if error:
        return jsonify({"error": error}), 400
    return jsonify(resultado)
