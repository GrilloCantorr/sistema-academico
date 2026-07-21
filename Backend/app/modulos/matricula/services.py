import io
import qrcode
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, Image
from app import db
from app.modelos.matricula import Matricula
from app.modelos.matricula_detalle import MatriculaDetalle
from app.modelos.estudiante import Estudiante
from app.modelos.estado_matricula import EstadoMatricula


class MatriculaService:

    @staticmethod
    def generar_pdf_ficha(matricula_id):
        matricula = db.session.get(Matricula, matricula_id)
        if not matricula:
            return None, "Matrícula no encontrada"

        estudiante = db.session.get(Estudiante, matricula.estudiante_id)
        detalles = MatriculaDetalle.query.filter_by(matricula_id=matricula_id).all()

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=30, rightMargin=30, topMargin=30, bottomMargin=30)
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle("TitleCenter", fontSize=16, leading=20, alignment=1, spaceAfter=6, fontName="Helvetica-Bold")
        subtitle_style = ParagraphStyle("SubtitleCenter", fontSize=10, leading=14, alignment=1, textColor=colors.HexColor("#4b5563"), spaceAfter=15)
        justified_style = ParagraphStyle("Justified", fontSize=10, leading=14, alignment=4, spaceAfter=12)
        title2_style = ParagraphStyle("Title2", fontSize=12, leading=16, spaceAfter=6, fontName="Helvetica-Bold")
        normal_style = styles["Normal"]

        elementos = []

        # 1. Membrete Institucional
        estudiante_codigo = estudiante.usuario.username if estudiante.usuario else str(estudiante.id)
        header_univ = [
            ["PORTAL ACADÉMICO UNIVERSITARIO", ""],
            ["OFICINA DE SERVICIOS ACADÉMICOS Y REGISTRO", f"Código Alumno: {estudiante_codigo}"],
            ["FICHA OFICIAL DE MATRÍCULA Y REGISTRO", f"Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}"]
        ]
        t_header = Table(header_univ, colWidths=[330, 170])
        t_header.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (0, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (0, 0), 11),
            ("TEXTCOLOR", (0, 0), (0, 0), colors.HexColor("#1e3a8a")),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 8),
            ("TEXTCOLOR", (0, 1), (-1, -1), colors.HexColor("#4b5563")),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LINEBELOW", (0, 2), (-1, 2), 1, colors.HexColor("#1e3a8a")),
        ]))
        elementos.append(t_header)
        elementos.append(Spacer(1, 15))

        # 2. Párrafo de Certificación
        texto_cert = (
            f"Por medio del presente documento, la Dirección de Servicios Académicos y Registro certifica que el estudiante "
            f"<b>{estudiante.nombres} {estudiante.apellido_paterno} {estudiante.apellido_materno}</b>, "
            f"inscrito en la especialidad de <b>{estudiante.especialidad.nombre if estudiante.especialidad else '—'}</b>, "
            f"se encuentra registrado e inscrito formalmente en las asignaturas detalladas a continuación."
        )
        elementos.append(Paragraph(texto_cert, justified_style))
        elementos.append(Spacer(1, 12))

        # 3. Metadatos de la matrícula
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

        # 4. Asignaturas inscritas
        elementos.append(Paragraph("Detalle de Asignaturas Inscritas", title2_style))
        elementos.append(Spacer(1, 6))

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
            elementos.append(Paragraph("No se encontraron cursos inscritos en esta matrícula.", normal_style))

        elementos.append(Spacer(1, 25))

        # 5. Firmas y QR Code
        url_verificacion = f"http://localhost:5000/api/matriculas/{matricula.id}/ficha"
        qr = qrcode.QRCode(version=1, box_size=4, border=1)
        qr.add_data(url_verificacion)
        qr.make(fit=True)
        img_qr = qr.make_image(fill_color="black", back_color="white")
        buf_qr = io.BytesIO()
        img_qr.save(buf_qr, format="PNG")
        buf_qr.seek(0)
        qr_flowable = Image(buf_qr, width=70, height=70)
        
        firmas_data = [
            ["___________________________", qr_flowable, "___________________________"],
            ["Oficina de Registro Académico", "Código de Verificación QR", "Firma del Estudiante"],
            ["Sello Digital Autorizado", f"Constancia N°: REG-{matricula.id:06d}", f"DNI: {estudiante.dni or '—'}"]
        ]
        t_firmas = Table(firmas_data, colWidths=[180, 140, 180])
        t_firmas.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 8),
            ("TEXTCOLOR", (0, 1), (-1, -1), colors.HexColor("#4b5563")),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ]))
        elementos.append(t_firmas)

        doc.build(elementos)
        buffer.seek(0)
        return buffer, None

    @staticmethod
    def _nombre_periodo_actual(fecha=None):
        fecha = fecha or datetime.now()
        semestre = "I" if fecha.month <= 6 else "II"
        return f"{fecha.year}-{semestre}"

    @staticmethod
    def periodo_actual():
        from app.modelos.periodo_academico import PeriodoAcademico

        fecha = datetime.now()
        nombre = MatriculaService._nombre_periodo_actual(fecha)
        periodo = PeriodoAcademico.query.filter_by(nombre=nombre).first()

        if periodo:
            return periodo

        if fecha.month <= 6:
            fecha_inicio = datetime(fecha.year, 1, 1)
            fecha_fin = datetime(fecha.year, 6, 30)
        else:
            fecha_inicio = datetime(fecha.year, 7, 1)
            fecha_fin = datetime(fecha.year, 12, 31)

        periodo = PeriodoAcademico(nombre=nombre, fecha_inicio=fecha_inicio, fecha_fin=fecha_fin)
        db.session.add(periodo)
        db.session.commit()
        return periodo

    @staticmethod
    def _cursos_aprobados_y_desaprobados(estudiante_id):
        from app.modelos.estado_curso import EstadoCurso

        matriculas_ids = [m.id for m in Matricula.query.filter_by(estudiante_id=estudiante_id).all()]
        detalles = MatriculaDetalle.query.filter(MatriculaDetalle.matricula_id.in_(matriculas_ids)).all()

        aprobados = set()
        desaprobados = set()

        for d in detalles:
            estado = db.session.get(EstadoCurso, d.estado_curso_id)
            curso_id = d.seccion_curso.curso_id
            if estado and estado.nombre.lower() == "aprobado":
                aprobados.add(curso_id)
                desaprobados.discard(curso_id)
            elif estado and estado.nombre.lower() == "desaprobado":
                if curso_id not in aprobados:
                    desaprobados.add(curso_id)

        return aprobados, desaprobados

    @staticmethod
    def _cursos_matriculados_activos(estudiante_id):
        from app.modelos.estado_curso import EstadoCurso

        matriculas_ids = [m.id for m in Matricula.query.filter_by(estudiante_id=estudiante_id).all()]
        detalles = MatriculaDetalle.query.filter(MatriculaDetalle.matricula_id.in_(matriculas_ids)).all()

        activos = set()
        for d in detalles:
            estado = db.session.get(EstadoCurso, d.estado_curso_id)
            if estado and estado.nombre.lower() == "cursando":
                activos.add(d.seccion_curso.curso_id)

        return activos

    @staticmethod
    def _prerequisitos_faltantes(curso_id, aprobados):
        from app.modelos.pre_requisito import PreRequisito

        requisitos = PreRequisito.query.filter_by(curso_dependiente_id=curso_id).all()
        return [r.curso_requisito for r in requisitos if r.curso_requisito_id not in aprobados]

    @staticmethod
    def cursos_disponibles(usuario_id, periodo_academico_id):
        from app.modelos.plan_estudiante import PlanEstudiante
        from app.modelos.plan_cursos_semestre import PlanCursosSemestre
        from app.modelos.seccion_curso import SeccionCurso

        estudiante = Estudiante.query.filter_by(usuario_id=usuario_id).first()
        if not estudiante:
            return None, "No se encontró un estudiante asociado a este usuario"

        plan_estudiante = PlanEstudiante.query.filter_by(estudiante_id=estudiante.id).first()
        if not plan_estudiante:
            return None, "El estudiante no tiene un plan de estudios asignado"

        plan_id = plan_estudiante.plan_estudios_id
        cursos_del_plan = PlanCursosSemestre.query.filter_by(plan_estudios_id=plan_id).order_by(
            PlanCursosSemestre.semestre_id
        ).all()

        aprobados, desaprobados = MatriculaService._cursos_aprobados_y_desaprobados(estudiante.id)
        matriculados_activos = MatriculaService._cursos_matriculados_activos(estudiante.id)

        semestres_ordenados = sorted(set(item.semestre_id for item in cursos_del_plan))
        semestre_actual = semestres_ordenados[-1] if semestres_ordenados else 1
        intentados = aprobados | desaprobados

        for sem in semestres_ordenados:
            cursos_sem = [i.curso_id for i in cursos_del_plan if i.semestre_id == sem]
            if not all(c in intentados for c in cursos_sem):
                semestre_actual = sem
                break
        else:
            semestre_actual = semestres_ordenados[-1] + 1 if semestres_ordenados else 1

        creditos_maximos = 22
        resultado = []

        def agregar_curso(item, tipo):
            curso = item.curso
            ya_matriculado = curso.id in matriculados_activos
            faltantes = [] if ya_matriculado else MatriculaService._prerequisitos_faltantes(curso.id, aprobados)
            seccion = SeccionCurso.query.filter_by(
                periodo_academico_id=periodo_academico_id,
                curso_id=curso.id,
                semestre_id=item.semestre_id
            ).first()

            habilitado = len(faltantes) == 0 and seccion is not None and not ya_matriculado
            motivo = None
            if ya_matriculado:
                motivo = "Ya te encuentras matriculado en este curso"
            elif faltantes:
                motivo = "Falta aprobar: " + ", ".join(f.nombre for f in faltantes)
            elif not seccion:
                motivo = "No hay seccion disponible para este curso en el periodo actual"

            horarios = []
            if seccion:
                for h in seccion.horarios:
                    horarios.append({"dia": h.dia, "hora_inicio": str(h.hora_inicio), "hora_fin": str(h.hora_fin)})

            resultado.append({
                "curso_id": curso.id,
                "curso_nombre": curso.nombre,
                "creditos": curso.creditos,
                "semestre_id": item.semestre_id,
                "tipo": tipo,
                "habilitado": habilitado,
                "motivo_bloqueo": motivo,
                "seccion_curso_id": seccion.id if seccion else None,
                "horarios": horarios
            })

        for item in cursos_del_plan:
            if item.semestre_id == semestre_actual:
                agregar_curso(item, "regular")

        for item in cursos_del_plan:
            if item.semestre_id < semestre_actual and item.curso_id in desaprobados:
                agregar_curso(item, "repetir")

        semestre_siguiente = semestre_actual + 1
        for item in cursos_del_plan:
            if item.semestre_id == semestre_siguiente:
                agregar_curso(item, "adelanto")

        return {
            "semestre_actual": semestre_actual,
            "creditos_maximos_por_ciclo": creditos_maximos,
            "cursos": resultado
        }, None

    @staticmethod
    def solicitar_matricula(usuario_id, secciones_seleccionadas):
        from app.modelos.estado_curso import EstadoCurso

        if not secciones_seleccionadas:
            return None, "Debes seleccionar al menos un curso"

        periodo = MatriculaService.periodo_actual()
        
        # Validar si el periodo actual sigue vigente para matriculas
        if periodo.fecha_fin and datetime.now() > periodo.fecha_fin:
            return None, "El periodo de matrícula ha finalizado. No se aceptan nuevas solicitudes."
            
        disponibles, error = MatriculaService.cursos_disponibles(usuario_id, periodo.id)
        if error:
            return None, error

        estudiante_actual = Estudiante.query.filter_by(usuario_id=usuario_id).first()
        estados_activos = ["pendiente", "validado", "matriculado"]
        matricula_activa = (
            Matricula.query.filter_by(estudiante_id=estudiante_actual.id, periodo_academico_id=periodo.id)
            .join(EstadoMatricula, Matricula.estado_id == EstadoMatricula.id)
            .filter(db.func.lower(EstadoMatricula.nombre).in_(estados_activos))
            .first()
        )
        if matricula_activa:
            return None, "Ya tienes una solicitud de matricula activa para este periodo, no puedes enviar otra"

        mapa_disponibles = {c["seccion_curso_id"]: c for c in disponibles["cursos"] if c["seccion_curso_id"]}

        total_creditos = 0
        horarios_ocupados = []

        for seccion_id in secciones_seleccionadas:
            curso_info = mapa_disponibles.get(seccion_id)

            if not curso_info:
                return None, f"La seccion {seccion_id} no esta disponible para este estudiante"

            if not curso_info["habilitado"]:
                return None, f"No puedes llevar '{curso_info['curso_nombre']}': {curso_info['motivo_bloqueo']}"

            for h in curso_info["horarios"]:
                for ocupado in horarios_ocupados:
                    if h["dia"] == ocupado["dia"] and h["hora_inicio"] < ocupado["hora_fin"] and h["hora_fin"] > ocupado["hora_inicio"]:
                        return None, f"Cruce de horario con el curso '{curso_info['curso_nombre']}'"
                horarios_ocupados.append(h)

            total_creditos += curso_info["creditos"]

        if total_creditos > disponibles["creditos_maximos_por_ciclo"]:
            return None, f"Excedes el maximo de {disponibles['creditos_maximos_por_ciclo']} creditos por ciclo"

        estado_pendiente = EstadoMatricula.query.filter_by(nombre="Pendiente").first()
        estado_cursando = EstadoCurso.query.filter_by(nombre="Cursando").first()

        matricula = Matricula(
            estudiante_id=estudiante_actual.id,
            periodo_academico_id=periodo.id,
            semestre_id=disponibles["semestre_actual"],
            estado_id=estado_pendiente.id,
        )
        db.session.add(matricula)
        db.session.flush()

        for seccion_id in secciones_seleccionadas:
            detalle = MatriculaDetalle(
                matricula_id=matricula.id,
                seccion_curso_id=seccion_id,
                estado_curso_id=estado_cursando.id if estado_cursando else None
            )
            db.session.add(detalle)

        db.session.commit()
        return {"id": matricula.id, "total_creditos": total_creditos}, None
