from io import BytesIO
from datetime import datetime

from sqlalchemy import func

from flask import jsonify, request, send_file
from flask_jwt_extended import get_jwt_identity
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak
from app import db
from app.modelos.historial_merito import HistorialMerito
from app.modelos.progreso_estudiante import ProgresoEstudiante
from app.modelos.tipo_clasificacion_merito import TipoClasificacionMerito
from app.modelos.estado_permanencia_estudiante import EstadoPermanenciaEstudiante
from app.modelos.estudiante import Estudiante
from app.modelos.matricula import Matricula
from app.modelos.matricula_detalle import MatriculaDetalle
from app.modelos.plan_estudiante import PlanEstudiante
from app.modelos.plan_cursos_semestre import PlanCursosSemestre
from app.modelos.curso import Curso


def obtener_record(estudiante_id):
    historial = HistorialMerito.query.filter_by(estudiante_id=estudiante_id).all()
    return jsonify([
        {
            "periodo_academico_id": h.periodo_academico_id,
            "semestre_id": h.semestre_id,
            "promedio_ponderado_periodo": float(h.promedio_ponderado_periodo),
            "creditos_aprobados_periodo": h.creditos_aprobados_periodo,
            "orden_merito": h.orden_merito,
            "tipo_clasificacion_id": h.tipo_clasificacion_id
        }
        for h in historial
    ])


def mi_historial():
    usuario_id = int(get_jwt_identity())
    estudiante = Estudiante.query.filter_by(usuario_id=usuario_id).first()

    if not estudiante:
        return jsonify({"error": "No se encontró un estudiante asociado a este usuario"}), 404

    historial = HistorialMerito.query.filter_by(estudiante_id=estudiante.id).all()
    progreso = db.session.get(ProgresoEstudiante, estudiante.id)

    cursos = []
    matriculas = Matricula.query.filter_by(estudiante_id=estudiante.id).all()
    for mat in matriculas:
        for det in mat.detalle:
            cursos.append({
                "periodo_academico_nombre": mat.periodo_academico.nombre if mat.periodo_academico else "—",
                "curso_nombre": det.seccion_curso.curso.nombre if det.seccion_curso.curso else "—",
                "nota_final": float(det.nota_final) if det.nota_final is not None else None,
                "estado_nombre": det.estado_curso.nombre if det.estado_curso else "—",
            })

    plan_progreso = None
    plan_est = PlanEstudiante.query.filter_by(estudiante_id=estudiante.id).first()
    if plan_est:
        total_creditos = db.session.query(func.sum(Curso.creditos)).join(
            PlanCursosSemestre, PlanCursosSemestre.curso_id == Curso.id
        ).filter(
            PlanCursosSemestre.plan_estudios_id == plan_est.plan_estudios_id
        ).scalar() or 0

        creditos_aprobados = progreso.creditos_aprobados_acumulados if progreso else 0
        plan_progreso = {
            "plan_estudios_id": plan_est.plan_estudios_id,
            "total_creditos_requeridos": total_creditos,
            "creditos_aprobados": creditos_aprobados,
            "porcentaje": round((creditos_aprobados / total_creditos) * 100, 1)
                if total_creditos > 0 else 0,
        }

    return jsonify({
        "historial": [
            {
                "periodo_academico_id": h.periodo_academico_id,
                "periodo_academico_nombre": h.periodo_academico.nombre if h.periodo_academico else "—",
                "semestre_id": h.semestre_id,
                "semestre_codigo": h.semestre.codigo if h.semestre else "—",
                "promedio_ponderado_periodo": float(h.promedio_ponderado_periodo),
                "creditos_aprobados_periodo": h.creditos_aprobados_periodo,
                "orden_merito": h.orden_merito,
                "tipo_clasificacion_id": h.tipo_clasificacion_id,
                "tipo_clasificacion_nombre": h.tipo_clasificacion.nombre if h.tipo_clasificacion else "—"
            }
            for h in historial
        ],
        "progreso_actual": {
            "creditos_aprobados_acumulados": progreso.creditos_aprobados_acumulados,
            "promedio_ponderado_acumulado": float(progreso.promedio_ponderado_acumulado),
            "estado_permanencia_id": progreso.estado_permanencia_id,
            "estado_permanencia_nombre": progreso.estado_permanencia.nombre if progreso.estado_permanencia else "—"
        } if progreso else None,
        "cursos": cursos,
        "plan_progreso": plan_progreso,
    })


def obtener_progreso(estudiante_id):
    progreso = db.session.get(ProgresoEstudiante, estudiante_id)
    if not progreso:
        return jsonify({"mensaje": "Progreso de estudiante no encontrado"}), 404
    return jsonify({
        "estudiante_id": progreso.estudiante_id,
        "estado_permanencia_id": progreso.estado_permanencia_id,
        "creditos_aprobados_acumulados": progreso.creditos_aprobados_acumulados,
        "promedio_ponderado_acumulado": float(progreso.promedio_ponderado_acumulado)
    })


def listar_tipos_clasificacion():
    tipos = TipoClasificacionMerito.query.all()
    return jsonify([
        {"id": t.id, "nombre": t.nombre, "porcentaje_limite": float(t.porcentaje_limite)}
        for t in tipos
    ])


def listar_estados_permanencia():
    estados = EstadoPermanenciaEstudiante.query.all()
    return jsonify([
        {"id": e.id, "nombre": e.nombre, "descripcion": e.descripcion}
        for e in estados
    ])


def reportes_consolidados():
    total_estudiantes = Estudiante.query.count()
    total_con_progreso = ProgresoEstudiante.query.count()

    progresos = ProgresoEstudiante.query.all()
    promedio_general = None
    if progresos:
        suma = sum(float(p.promedio_ponderado_acumulado) for p in progresos)
        promedio_general = round(suma / len(progresos), 2)

    return jsonify({
        "total_estudiantes": total_estudiantes,
        "estudiantes_con_registro_de_progreso": total_con_progreso,
        "promedio_general_institucional": promedio_general
    })


def desempeno_por_cohorte():
    historiales = HistorialMerito.query.all()
    agrupado = {}

    for h in historiales:
        clave = h.especialidad_id or 0
        if clave not in agrupado:
            agrupado[clave] = {
                "especialidad_id": h.especialidad_id,
                "especialidad_nombre": h.especialidad.nombre if h.especialidad else "Sin especialidad",
                "promedios": [],
                "total_estudiantes": 0
            }
        agrupado[clave]["promedios"].append(float(h.promedio_ponderado_periodo))
        agrupado[clave]["total_estudiantes"] += 1

    resultado = []
    for clave, datos in agrupado.items():
        promedio = round(sum(datos["promedios"]) / len(datos["promedios"]), 2)
        resultado.append({
            "especialidad_id": datos["especialidad_id"],
            "especialidad_nombre": datos["especialidad_nombre"],
            "total_estudiantes": datos["total_estudiantes"],
            "promedio_ponderado": promedio
        })

    return jsonify(resultado)


def buscar_estudiantes():
    q = request.args.get("q", "").strip()
    if not q or len(q) < 2:
        return jsonify([])

    estudiantes = Estudiante.query.filter(
        db.or_(
            Estudiante.nombres.ilike(f"%{q}%"),
            Estudiante.apellido_paterno.ilike(f"%{q}%"),
            Estudiante.apellido_materno.ilike(f"%{q}%"),
            Estudiante.correo_institucional.ilike(f"%{q}%"),
            Estudiante.id.cast(db.String).ilike(f"%{q}%"),
        )
    ).filter(Estudiante.deleted_at.is_(None)).limit(20).all()

    return jsonify([
        {
            "id": e.id,
            "nombres": e.nombres,
            "apellido_paterno": e.apellido_paterno,
            "apellido_materno": e.apellido_materno,
            "nombre_completo": f"{e.nombres} {e.apellido_paterno} {e.apellido_materno}",
            "correo_institucional": e.correo_institucional,
            "especialidad_nombre": e.especialidad.nombre if e.especialidad else "—",
        }
        for e in estudiantes
    ])


def kardex_estudiante(estudiante_id):
    estudiante = db.session.get(Estudiante, estudiante_id)
    if not estudiante:
        return jsonify({"error": "Estudiante no encontrado"}), 404

    cursos = []
    matriculas = Matricula.query.filter_by(estudiante_id=estudiante.id).all()
    for mat in matriculas:
        for det in mat.detalle:
            cursos.append({
                "periodo_academico_nombre": mat.periodo_academico.nombre if mat.periodo_academico else "—",
                "curso_nombre": det.seccion_curso.curso.nombre if det.seccion_curso.curso else "—",
                "creditos": det.seccion_curso.curso.creditos if det.seccion_curso.curso else 0,
                "nota_final": float(det.nota_final) if det.nota_final is not None else None,
                "estado_nombre": det.estado_curso.nombre if det.estado_curso else "—",
            })

    progreso = db.session.get(ProgresoEstudiante, estudiante.id)

    historial = HistorialMerito.query.filter_by(estudiante_id=estudiante.id).all()

    plan_progreso = None
    plan_est = PlanEstudiante.query.filter_by(estudiante_id=estudiante.id).first()
    if plan_est:
        total_creditos = db.session.query(func.sum(Curso.creditos)).join(
            PlanCursosSemestre, PlanCursosSemestre.curso_id == Curso.id
        ).filter(
            PlanCursosSemestre.plan_estudios_id == plan_est.plan_estudios_id
        ).scalar() or 0
        creditos_aprobados = progreso.creditos_aprobados_acumulados if progreso else 0
        plan_progreso = {
            "total_creditos_requeridos": total_creditos,
            "creditos_aprobados": creditos_aprobados,
            "porcentaje": round((creditos_aprobados / total_creditos) * 100, 1) if total_creditos > 0 else 0,
        }

    return jsonify({
        "estudiante": {
            "id": estudiante.id,
            "nombres": estudiante.nombres,
            "apellido_paterno": estudiante.apellido_paterno,
            "apellido_materno": estudiante.apellido_materno,
            "nombre_completo": f"{estudiante.nombres} {estudiante.apellido_paterno} {estudiante.apellido_materno}",
            "correo_institucional": estudiante.correo_institucional,
            "codigo": estudiante.usuario.username if estudiante.usuario else "—",
            "especialidad_nombre": estudiante.especialidad.nombre if estudiante.especialidad else "—",
            "facultad_nombre": estudiante.especialidad.facultad.nombre if estudiante.especialidad and estudiante.especialidad.facultad else "—",
        },
        "cursos": cursos,
        "progreso_actual": {
            "creditos_aprobados_acumulados": progreso.creditos_aprobados_acumulados,
            "promedio_ponderado_acumulado": float(progreso.promedio_ponderado_acumulado),
            "estado_permanencia_nombre": progreso.estado_permanencia.nombre if progreso.estado_permanencia else "—",
        } if progreso else None,
        "historial": [
            {
                "periodo_academico_nombre": h.periodo_academico.nombre if h.periodo_academico else "—",
                "promedio_ponderado_periodo": float(h.promedio_ponderado_periodo),
                "creditos_aprobados_periodo": h.creditos_aprobados_periodo,
                "orden_merito": h.orden_merito,
                "tipo_clasificacion_nombre": h.tipo_clasificacion.nombre if h.tipo_clasificacion else "—",
            }
            for h in historial
        ],
        "plan_progreso": plan_progreso,
    })


def descargar_kardex_pdf(estudiante_id):
    from app.modulos.certificados.services import CertificadoService

    data = kardex_estudiante(estudiante_id)
    if isinstance(data, tuple):
        return data

    estudiante = data.get_json()["estudiante"]
    cursos = data.get_json()["cursos"]
    progreso = data.get_json()["progreso_actual"]
    historial = data.get_json()["historial"]
    plan_data = data.get_json()["plan_progreso"]

    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=30, rightMargin=30, topMargin=30, bottomMargin=30)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("Title2", fontSize=16, leading=20, spaceAfter=12, fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle("Subtitle", fontSize=10, leading=14, textColor=colors.grey, spaceAfter=6))
    styles.add(ParagraphStyle("Small", fontSize=8, leading=10, fontName="Helvetica"))

    elementos = []

    elementos.append(Paragraph("KARDEX ACADÉMICO", styles["Title2"]))
    elementos.append(Paragraph(f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles["Subtitle"]))
    elementos.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#2563eb")))
    elementos.append(Spacer(1, 12))

    data_est = [
        ["Estudiante:", estudiante["nombre_completo"], "Código:", estudiante["codigo"] or "—"],
        ["Especialidad:", estudiante["especialidad_nombre"], "Facultad:", estudiante["facultad_nombre"]],
    ]
    t = Table(data_est, colWidths=[80, 180, 60, 150])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    elementos.append(t)
    elementos.append(Spacer(1, 10))

    if progreso:
        data_prog = [
            ["PPA:", str(progreso["promedio_ponderado_acumulado"]),
             "Créditos:", str(progreso["creditos_aprobados_acumulados"]),
             "Estado:", progreso["estado_permanencia_nombre"]],
        ]
        t = Table(data_prog, colWidths=[40, 60, 60, 50, 50, 120])
        t.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#eff6ff")),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (1, 0), (1, 0), "CENTER"),
            ("ALIGN", (3, 0), (3, 0), "CENTER"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        elementos.append(t)
        elementos.append(Spacer(1, 12))

    elementos.append(Paragraph("Cursos cursados", styles["Title2"]))
    elementos.append(Spacer(1, 6))

    if cursos:
        header = [["Periodo", "Curso", "Créd.", "Nota", "Estado"]]
        rows = [[
            c["periodo_academico_nombre"],
            c["curso_nombre"],
            str(c["creditos"]),
            str(c["nota_final"]) if c["nota_final"] is not None else "—",
            c["estado_nombre"],
        ] for c in cursos]
        t = Table(header + rows, colWidths=[70, 190, 35, 40, 80])
        t.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563eb")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (2, 0), (3, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
        ]))
        elementos.append(t)
    else:
        elementos.append(Paragraph("Sin cursos registrados.", styles["Normal"]))

    elementos.append(Spacer(1, 16))

    if plan_data:
        elementos.append(Paragraph(
            f"Avance del plan: {plan_data['creditos_aprobados']} / {plan_data['total_creditos_requeridos']} créditos ({plan_data['porcentaje']}%)",
            styles["Normal"]
        ))

    # -------------------------------------------------------------
    # PÁGINA 2: CONSTANCIA DE INSCRIPCIÓN / MATRÍCULA
    # -------------------------------------------------------------
    matricula = Matricula.query.filter_by(estudiante_id=estudiante_id).order_by(Matricula.id.desc()).first()
    if matricula:
        elementos.append(PageBreak())
        
        # Estilos específicos para la segunda página
        styles.add(ParagraphStyle("TitleCenter", fontSize=16, leading=20, alignment=1, spaceAfter=6, fontName="Helvetica-Bold"))
        styles.add(ParagraphStyle("SubtitleCenter", fontSize=10, leading=14, alignment=1, textColor=colors.HexColor("#4b5563"), spaceAfter=15))
        styles.add(ParagraphStyle("Justified", fontSize=10, leading=14, alignment=4, spaceAfter=12))
        
        elementos.append(Paragraph("CONSTANCIA OFICIAL DE INSCRIPCIÓN", styles["TitleCenter"]))
        periodo_nombre = matricula.periodo_academico.nombre if matricula.periodo_academico else f"Periodo {matricula.periodo_academico_id}"
        elementos.append(Paragraph(f"Periodo Académico: {periodo_nombre}", styles["SubtitleCenter"]))
        
        elementos.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#059669")))  # Verde para la constancia
        elementos.append(Spacer(1, 15))
        
        texto_cert = (
            f"La Dirección de Servicios Académicos y Registro certifica que el estudiante "
            f"<b>{estudiante['nombre_completo']}</b>, identificado con el código <b>{estudiante['codigo'] or estudiante['id']}</b> "
            f"e inscrito en la especialidad de <b>{estudiante['especialidad_nombre']}</b>, se encuentra registrado "
            f"e inscrito formalmente en las asignaturas detalladas a continuación."
        )
        elementos.append(Paragraph(texto_cert, styles["Justified"]))
        elementos.append(Spacer(1, 12))
        
        semestre_codigo = matricula.semestre.codigo if matricula.semestre else f"Semestre {matricula.semestre_id}"
        estado_nombre = matricula.estado.nombre if matricula.estado else "Pendiente"
        pago_estado = "Confirmado / Pagado" if matricula.pagado else "Pendiente de Pago"
        fecha_reg = matricula.created_at.strftime('%d/%m/%Y %H:%M') if matricula.created_at else datetime.now().strftime('%d/%m/%Y')
        
        meta_data = [
            ["N° Solicitud/Matrícula:", str(matricula.id), "Semestre de Ingreso:", semestre_codigo],
            ["Fecha de Registro:", fecha_reg, "Estado Administrativo:", estado_nombre],
            ["Derecho de Pago:", pago_estado, "Condición Académica:", "Regular"]
        ]
        t_meta = Table(meta_data, colWidths=[130, 120, 130, 120])
        t_meta.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("TEXTCOLOR", (1, 2), (1, 2), colors.HexColor("#10b981") if matricula.pagado else colors.HexColor("#ef4444")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#f3f4f6")),
        ]))
        elementos.append(t_meta)
        elementos.append(Spacer(1, 15))
        
        elementos.append(Paragraph("Detalle de Asignaturas Inscritas", styles["Title2"]))
        elementos.append(Spacer(1, 6))
        
        detalles = MatriculaDetalle.query.filter_by(matricula_id=matricula.id).all()
        if detalles:
            header_det = [["Código", "Asignatura / Curso", "Sección", "Créditos"]]
            rows_det = []
            total_creditos = 0
            for d in detalles:
                seccion = d.seccion_curso
                curso = seccion.curso if seccion else None
                curso_codigo = curso.codigo if curso else "—"
                curso_nom = curso.nombre if curso else f"Sección {d.seccion_curso_id}"
                seccion_nom = f"Sec. {seccion.id}" if seccion else "Única"
                cred = curso.creditos if curso else 0
                total_creditos += cred
                
                rows_det.append([curso_codigo, curso_nom, seccion_nom, str(cred)])
            
            rows_det.append(["", "TOTAL CRÉDITOS INSCRITOS", "", str(total_creditos)])
            
            t_det = Table(header_det + rows_det, colWidths=[70, 230, 80, 60])
            t_det.setStyle(TableStyle([
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#059669")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (3, 0), (3, -1), "CENTER"),
                ("ALIGN", (2, 0), (2, -1), "CENTER"),
                ("GRID", (0, 0), (-1, -2), 0.5, colors.HexColor("#e5e7eb")),
                ("FONTNAME", (1, -1), (1, -1), "Helvetica-Bold"),
                ("FONTNAME", (3, -1), (3, -1), "Helvetica-Bold"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#fafdfb")]),
            ]))
            elementos.append(t_det)
        else:
            elementos.append(Paragraph("No se encontraron cursos inscritos en esta matrícula.", styles["Normal"]))
            
        elementos.append(Spacer(1, 35))
        
        firmas_data = [
            ["", ""],
            ["___________________________", "___________________________"],
            ["Oficina de Registro Académico", "Firma del Estudiante"],
            ["Sello Digital Autorizado", f"Código de Validación: REG-{matricula.id:06d}"]
        ]
        t_firmas = Table(firmas_data, colWidths=[240, 240])
        t_firmas.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 2), (-1, 3), "Helvetica"),
            ("FONTSIZE", (0, 2), (-1, -1), 8),
            ("TEXTCOLOR", (0, 2), (-1, -1), colors.HexColor("#4b5563")),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ]))
        elementos.append(t_firmas)

    doc.build(elementos)
    buf.seek(0)
    return send_file(buf, mimetype="application/pdf", as_attachment=True,
                     download_name=f"kardex_{estudiante['codigo'] or estudiante['id']}.pdf")