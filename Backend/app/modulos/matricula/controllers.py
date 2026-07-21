from datetime import datetime

from flask import jsonify, request, send_file
from flask_jwt_extended import get_jwt_identity
from app import db
from app.modelos.estudiante import Estudiante
from app.modelos.periodo_academico import PeriodoAcademico
from app.modelos.seccion_curso import SeccionCurso
from app.modelos.matricula import Matricula
from app.modelos.estado_matricula import EstadoMatricula
from app.modelos.auditoria import Auditoria
from app.modulos.matricula.services import MatriculaService


def listar_periodos():
    periodos = PeriodoAcademico.query.order_by(PeriodoAcademico.fecha_inicio.desc()).all()
    return jsonify([
        {
            "id": p.id,
            "nombre": p.nombre,
            "fecha_inicio": p.fecha_inicio,
            "fecha_fin": p.fecha_fin
        }
        for p in periodos
    ])


def periodo_actual():
    periodo = MatriculaService.periodo_actual()
    return jsonify({
        "id": periodo.id,
        "nombre": periodo.nombre,
        "fecha_inicio": periodo.fecha_inicio.isoformat() if isinstance(periodo.fecha_inicio, datetime) else periodo.fecha_inicio,
        "fecha_fin": periodo.fecha_fin.isoformat() if isinstance(periodo.fecha_fin, datetime) else periodo.fecha_fin
    })


def listar_secciones():
    periodo = MatriculaService.periodo_actual()
    secciones = SeccionCurso.query.filter_by(periodo_academico_id=periodo.id).all()

    return jsonify([
        {
            "id": s.id,
            "periodo_academico_nombre": s.periodo_academico.nombre,
            "periodo_academico_id": s.periodo_academico_id,
            "curso_nombre": s.curso.nombre,
            "curso_id": s.curso_id,
            "semestre_codigo": s.semestre.codigo,
            "semestre_id": s.semestre_id,
            "cupos": s.cupos
        }
        for s in secciones
    ])


def listar_matriculas():
    matriculas = Matricula.query.filter(Matricula.deleted_at.is_(None)).all()
    return jsonify([
        {
            "id": m.id,
            "estudiante_id": m.estudiante_id,
            "estudiante_nombre": f"{m.estudiante.nombres} {m.estudiante.apellido_paterno}" if m.estudiante else "—",
            "periodo_academico_id": m.periodo_academico_id,
            "semestre_id": m.semestre_id,
            "estado_id": m.estado_id,
            "estado_nombre": m.estado.nombre if m.estado else "—",
            "pagado": m.pagado,
        }
        for m in matriculas
    ])


def crear_matricula():
    usuario_id = int(get_jwt_identity())
    data = request.get_json()
    secciones_seleccionadas = data.get("secciones_curso_ids", [])

    if not isinstance(secciones_seleccionadas, list) or not secciones_seleccionadas:
        return jsonify({"error": "Debes enviar una lista de IDs de secciones"}), 400

    if not all(isinstance(s, int) for s in secciones_seleccionadas):
        return jsonify({"error": "Todos los IDs de secciones deben ser numeros enteros"}), 400

    resultado, error = MatriculaService.solicitar_matricula(usuario_id, secciones_seleccionadas)

    if error:
        return jsonify({"error": error}), 400

    return jsonify({"mensaje": "Solicitud de matrícula registrada", **resultado}), 201


def listar_estados_matricula():
    estados = EstadoMatricula.query.all()
    return jsonify([
        {"id": e.id, "nombre": e.nombre}
        for e in estados
    ])


def validar_requisitos(matricula_id):
    matricula = db.session.get(Matricula, matricula_id)
    if not matricula:
        return jsonify({"error": "Matrícula no encontrada"}), 404

    if matricula.estado_id != 1:
        return jsonify({"error": "Solo se pueden validar matrículas pendientes"}), 400

    matricula.estado_id = 2

    Auditoria.registrar(
        usuario_id=int(get_jwt_identity()),
        accion="validar_matricula",
        detalle=f"Matrícula #{matricula_id} validada (pendiente→validada)"
    )

    db.session.commit()

    return jsonify({"mensaje": "Requisitos validados", "matricula_id": matricula.id})


def registrar_pago(matricula_id):
    usuario_id = get_jwt_identity()
    matricula = db.session.get(Matricula, matricula_id)
    if not matricula:
        return jsonify({"error": "Matrícula no encontrada"}), 404

    if matricula.estado_id != 2:
        return jsonify({"error": "La matrícula debe estar validada antes de registrar el pago"}), 400

    matricula.pagado = True

    Auditoria.registrar(
        usuario_id=usuario_id,
        accion="registrar_pago",
        detalle=f"Pago registrado para matrícula #{matricula_id}"
    )

    db.session.commit()

    return jsonify({"mensaje": "Pago registrado", "matricula_id": matricula.id})


def generar_ficha_oficial(matricula_id):
    matricula = db.session.get(Matricula, matricula_id)
    if not matricula:
        return jsonify({"error": "Matrícula no encontrada"}), 404

    if not matricula.pagado:
        return jsonify({"error": "No se puede generar la ficha sin el pago registrado"}), 400

    matricula.estado_id = 3

    Auditoria.registrar(
        usuario_id=int(get_jwt_identity()),
        accion="generar_ficha_matricula",
        detalle=f"Ficha oficial generada para matrícula #{matricula_id}"
    )

    db.session.commit()

    return jsonify({
        "mensaje": "Ficha oficial generada, matrícula confirmada",
        "matricula": {
            "id": matricula.id,
            "estudiante_id": matricula.estudiante_id,
            "estado_id": matricula.estado_id,
            "estado_nombre": matricula.estado.nombre if matricula.estado else "—",
            "pagado": matricula.pagado,
        }
    })


def estadisticas():
    query = Matricula.query.filter(Matricula.deleted_at.is_(None))
    total = query.count()
    matriculados = query.filter_by(estado_id=3).count()
    pendientes = query.filter_by(estado_id=1).count()
    validados = query.filter_by(estado_id=2).count()

    return jsonify({
        "total_solicitudes": total,
        "matriculados": matriculados,
        "pendientes": pendientes,
        "validados": validados
    })


def descargar_ficha(matricula_id):
    buffer, error = MatriculaService.generar_pdf_ficha(matricula_id)

    if error:
        return jsonify({"error": error}), 404

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"ficha_matricula_{matricula_id}.pdf",
        mimetype="application/pdf"
    )


def cursos_disponibles():
    usuario_id = int(get_jwt_identity())
    periodo = MatriculaService.periodo_actual()

    resultado, error = MatriculaService.cursos_disponibles(usuario_id, periodo.id)

    if error:
        return jsonify({"error": error}), 400

    return jsonify(resultado)
