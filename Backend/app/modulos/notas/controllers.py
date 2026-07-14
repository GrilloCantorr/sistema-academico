from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from app import db
from app.modelos.seccion_curso import SeccionCurso
from app.modelos.matricula_detalle import MatriculaDetalle
from app.modelos.acta import Acta
from app.modelos.auditoria import Auditoria
from app.modulos.notas.services import NotasService


def obtener_notas():
    oferta_academica_id = request.args.get("oferta_academica_id", type=int)
    query = MatriculaDetalle.query
    if oferta_academica_id:
        query = query.filter_by(seccion_curso_id=oferta_academica_id)

    detalles = query.all()
    return jsonify([
        {
            "matricula_id": d.matricula_id,
            "seccion_curso_id": d.seccion_curso_id,
            "nota_parcial": float(d.nota_parcial) if d.nota_parcial is not None else None,
            "nota_final": float(d.nota_final) if d.nota_final is not None else None,
            "estado_nombre": d.estado_curso.nombre if d.estado_curso else None,
        }
        for d in detalles
    ])


def obtener_notas_matricula(matricula_id):
    detalles = MatriculaDetalle.query.filter_by(matricula_id=matricula_id).all()
    return jsonify([
        {
            "matricula_id": d.matricula_id,
            "seccion_curso_id": d.seccion_curso_id,
            "curso_nombre": d.seccion_curso.curso.nombre if d.seccion_curso.curso else "—",
            "nota_parcial": float(d.nota_parcial) if d.nota_parcial is not None else None,
            "nota_final": float(d.nota_final) if d.nota_final is not None else None,
            "estado_nombre": d.estado_curso.nombre if d.estado_curso else None,
        }
        for d in detalles
    ])


def registrar_nota():
    data = request.get_json()

    if not data.get("matricula_id") or not data.get("seccion_curso_id"):
        return jsonify({"error": "matricula_id y seccion_curso_id son requeridos"}), 400

    resultado, error, codigo = NotasService.registrar_nota(
        usuario_id=int(get_jwt_identity()),
        matricula_id=data.get("matricula_id"),
        seccion_curso_id=data.get("seccion_curso_id"),
        nota_parcial=data.get("nota_parcial"),
        nota_final=data.get("nota_final"),
        estado_curso_id=data.get("estado_curso_id"),
    )

    if error:
        return jsonify({"error": error}), codigo

    return jsonify({"mensaje": "Nota registrada correctamente", "data": resultado})


def mi_hoja_de_notas():
    usuario_id = int(get_jwt_identity())
    semestre_id = request.args.get("semestre_id", type=int)

    resultado, error = NotasService.obtener_hoja_notas(usuario_id, semestre_id)

    if error:
        return jsonify({"error": error}), 400

    return jsonify(resultado)


def mis_cursos_notas():
    usuario_id = int(get_jwt_identity())

    resultado, error = NotasService.mis_cursos_con_notas(usuario_id)

    if error:
        return jsonify({"error": error}), 404

    return jsonify(resultado)


def listar_estados():
    from app.modelos.estado_curso import EstadoCurso
    estados = EstadoCurso.query.all()
    return jsonify([
        {"id": e.id, "nombre": e.nombre}
        for e in estados
    ])


def validar_actas():
    ofertas = SeccionCurso.query.all()
    items = []
    for o in ofertas:
        total = MatriculaDetalle.query.filter_by(seccion_curso_id=o.id).count()
        con_nota = MatriculaDetalle.query.filter(
            MatriculaDetalle.seccion_curso_id == o.id,
            MatriculaDetalle.nota_final.isnot(None)
        ).count()
        acta = Acta.query.filter_by(seccion_curso_id=o.id).first()

        items.append({
            "seccion_curso_id": o.id,
            "curso_nombre": o.curso.nombre if o.curso else "—",
            "total_estudiantes": total,
            "con_nota": con_nota,
            "pendientes": total - con_nota,
            "acta_cerrada": acta.estado == "Cerrada" if acta else False,
        })

    return jsonify({"items": items})


def cerrar_acta():
    data = request.get_json()
    seccion_curso_id = data.get("seccion_curso_id")

    seccion = db.session.get(SeccionCurso, seccion_curso_id)
    if not seccion:
        return jsonify({"error": "Seccion no encontrada"}), 404

    acta = Acta.query.filter_by(seccion_curso_id=seccion_curso_id).first()
    usuario_id = int(get_jwt_identity())

    if acta:
        acta.estado = "Cerrada" if acta.estado != "Cerrada" else "Abierta"
        if acta.estado == "Cerrada":
            acta.fecha_cierre = db.func.now()
        detalle_msg = f"Acta cerrada para seccion #{seccion_curso_id}"
    else:
        acta = Acta(
            seccion_curso_id=seccion_curso_id,
            estado="Cerrada",
            fecha_cierre=db.func.now(),
        )
        db.session.add(acta)
        detalle_msg = f"Acta cerrada para seccion #{seccion_curso_id}"

    Auditoria.registrar(usuario_id, "cerrar_acta", detalle_msg)
    db.session.commit()

    return jsonify({
        "mensaje": f"Acta de seccion #{seccion_curso_id} {'cerrada' if acta.estado == 'Cerrada' else 'reabierta'} correctamente"
    })


def indicadores_academicos():
    resultado, error = NotasService.indicadores_academicos()
    if error:
        return jsonify({"error": error}), 400
    return jsonify(resultado)
