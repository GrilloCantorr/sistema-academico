import os
import uuid
from datetime import datetime
from app import db
from app.modelos.silabo import Silabo
from app.modelos.docente import Docente
from app.modelos.curso import Curso
from app.modelos.seccion_curso import SeccionCurso
from app.modelos.seccion_docente import SeccionDocente
from app.modelos.seccion_horario import SeccionHorario
from app.modelos.periodo_academico import PeriodoAcademico
from app.modelos.semestre import Semestre
from app.modelos.plan_cursos_semestre import PlanCursosSemestre
from app.modelos.plan_de_estudios import PlanDeEstudios
from app.modelos.especialidad import Especialidad

CARPETA_SILABOS = os.path.join(os.getcwd(), "uploads", "silabos")
TAMANO_MAXIMO_SILABO_BYTES = 10 * 1024 * 1024
CARGA_MINIMA_SEMANAL = 8
CARGA_MAXIMA_SEMANAL = 20

DIAS_SEMANA = {
    1: "Lunes", 2: "Martes", 3: "Miercoles", 4: "Jueves",
    5: "Viernes", 6: "Sabado", 7: "Domingo",
}


class CursosDocentesService:

    @staticmethod
    def periodo_activo():
        hoy = datetime.utcnow()
        periodo = (
            PeriodoAcademico.query
            .filter(PeriodoAcademico.fecha_inicio <= hoy, PeriodoAcademico.fecha_fin >= hoy)
            .order_by(PeriodoAcademico.fecha_inicio.desc())
            .first()
        )
        if periodo:
            return periodo
        return PeriodoAcademico.query.order_by(PeriodoAcademico.fecha_inicio.desc()).first()

    @staticmethod
    def periodos_historicos_docente(usuario_id):
        docente = Docente.query.filter_by(usuario_id=usuario_id).first()
        if not docente:
            return [], "No se encontro un docente asociado a este usuario"

        periodos_ids = (
            db.session.query(SeccionCurso.periodo_academico_id)
            .join(SeccionDocente, SeccionDocente.seccion_curso_id == SeccionCurso.id)
            .filter(SeccionDocente.docente_id == docente.id)
            .distinct()
            .all()
        )
        ids = [p[0] for p in periodos_ids]

        periodos = (
            PeriodoAcademico.query.filter(PeriodoAcademico.id.in_(ids))
            .order_by(PeriodoAcademico.fecha_inicio.desc())
            .all()
        )

        return [{
            "id": p.id,
            "nombre": p.nombre
        } for p in periodos
        ], None

    @staticmethod
    def crear_curso(nombre, codigo, creditos, horas_lectivas, horas_practicas):
        if not nombre or not str(nombre).strip():
            return None, "El nombre del curso es obligatorio", 400
        if not codigo or not str(codigo).strip():
            return None, "El codigo del curso es obligatorio", 400

        codigo_normalizado = str(codigo).strip().upper()
        if Curso.query.filter_by(codigo=codigo_normalizado).first():
            return None, f"Ya existe un curso registrado con el codigo {codigo_normalizado}", 409

        try:
            creditos = int(creditos)
            horas_lectivas = int(horas_lectivas)
            horas_practicas = int(horas_practicas)
        except (TypeError, ValueError):
            return None, "Creditos, horas lectivas y horas practicas deben ser numeros enteros", 422

        if creditos <= 0:
            return None, "Los creditos deben ser un numero entero positivo", 422
        if horas_lectivas < 0 or horas_practicas < 0:
            return None, "Las horas lectivas y practicas no pueden ser negativas", 422
        if horas_lectivas + horas_practicas <= 0:
            return None, "El curso debe tener al menos una hora lectiva o practica", 422

        curso = Curso(
            nombre=str(nombre).strip(),
            codigo=codigo_normalizado,
            creditos=creditos,
            horas_lectivas=horas_lectivas,
            horas_practicas=horas_practicas,
        )
        db.session.add(curso)
        db.session.commit()

        return {
            "id": curso.id,
            "nombre": curso.nombre,
            "codigo": curso.codigo,
            "creditos": curso.creditos,
            "horas_lectivas": curso.horas_lectivas,
            "horas_practicas": curso.horas_practicas,
        }, None, 201

    @staticmethod
    def crear_seccion_curso(curso_id, periodo_academico_id, semestre_id, cupos=None):
        if not curso_id or not periodo_academico_id or not semestre_id:
            return None, "Debes seleccionar el curso, el periodo academico y el semestre", 400

        curso = Curso.query.get(curso_id)
        if not curso:
            return None, "Curso no encontrado", 404

        periodo = PeriodoAcademico.query.get(periodo_academico_id)
        if not periodo:
            return None, "Periodo academico no encontrado", 404

        semestre = Semestre.query.get(semestre_id)
        if not semestre:
            return None, "Semestre no encontrado", 404

        existente = SeccionCurso.query.filter_by(
            curso_id=curso_id,
            periodo_academico_id=periodo_academico_id,
            semestre_id=semestre_id,
        ).first()
        if existente:
            return None, (
                "Ya existe una seccion abierta para este curso en el semestre y periodo seleccionados"
            ), 409

        if cupos is not None:
            try:
                cupos = int(cupos)
            except (TypeError, ValueError):
                return None, "Los cupos deben ser un numero entero", 422
            if cupos <= 0:
                return None, "Los cupos deben ser un numero entero positivo", 422

        seccion = SeccionCurso(
            curso_id=curso_id,
            periodo_academico_id=periodo_academico_id,
            semestre_id=semestre_id,
            cupos=cupos or 40,
        )
        db.session.add(seccion)
        db.session.commit()

        return {
            "id": seccion.id,
            "curso_id": seccion.curso_id,
            "curso_nombre": curso.nombre,
            "periodo_academico_id": seccion.periodo_academico_id,
            "semestre_id": seccion.semestre_id,
            "semestre_codigo": semestre.codigo,
            "cupos": seccion.cupos,
        }, None, 201

    @staticmethod
    def asignaciones_seccion(seccion_curso_id):
        seccion = SeccionCurso.query.get(seccion_curso_id)
        if not seccion:
            return None, "Seccion no encontrada"

        curso = seccion.curso
        horas_requeridas_curso = curso.horas_lectivas + curso.horas_practicas

        asignaciones = SeccionDocente.query.filter_by(
            seccion_curso_id=seccion_curso_id
        ).all()
        horarios = SeccionHorario.query.filter_by(
            seccion_curso_id=seccion_curso_id
        ).all()

        suma_horas_asignadas = sum(a.horas_asignadas or 0 for a in asignaciones)

        return {
            "seccion_curso_id": seccion.id,
            "curso_nombre": curso.nombre,
            "horas_requeridas_curso": horas_requeridas_curso,
            "suma_horas_asignadas": suma_horas_asignadas,
            "docentes_asignados": [
                {
                    "asignacion_id": a.id,
                    "docente_id": a.docente_id,
                    "docente_nombre": (
                        f"{a.docente.nombres} {a.docente.apellido_paterno}" if a.docente else None
                    ),
                    "horas_asignadas": a.horas_asignadas,
                }
                for a in asignaciones
            ],
            "horarios": [
                {
                    "id": h.id,
                    "dia": DIAS_SEMANA.get(h.dia, h.dia),
                    "hora_inicio": h.hora_inicio.strftime("%H:%M") if h.hora_inicio else None,
                    "hora_fin": h.hora_fin.strftime("%H:%M") if h.hora_fin else None,
                    "aula": h.aula,
                }
                for h in horarios
            ],
        }, None

    @staticmethod
    def mis_cursos(usuario_id, periodo_academico_id=None):
        docente = Docente.query.filter_by(usuario_id=usuario_id).first()
        if not docente:
            return None, "No se encontro un docente asociado a este usuario"

        if not periodo_academico_id:
            periodo = CursosDocentesService.periodo_activo()
            periodo_academico_id = periodo.id if periodo else None

        asignaciones = (
            SeccionDocente.query.filter_by(docente_id=docente.id)
            .join(SeccionCurso, SeccionDocente.seccion_curso_id == SeccionCurso.id)
            .filter(SeccionCurso.periodo_academico_id == periodo_academico_id)
            .all()
        )

        resultado = []
        for a in asignaciones:
            seccion = a.seccion_curso
            curso = seccion.curso
            horarios = SeccionHorario.query.filter_by(seccion_curso_id=seccion.id).all()
            silabo = Silabo.query.filter_by(seccion_curso_id=seccion.id).first()

            resultado.append({
                "seccion_curso_id": seccion.id,
                "codigo_curso": curso.codigo,
                "nombre_curso": curso.nombre,
                "creditos": curso.creditos,
                "seccion": f"S-{seccion.id}",
                "horas_semanales": a.horas_asignadas,
                "estado_silabo": "Silabo Cargado" if silabo else "Silabo Pendiente",
                "horario": [
                    {
                        "dia": DIAS_SEMANA.get(h.dia, h.dia),
                        "dia_numero": h.dia,
                        "hora_inicio": h.hora_inicio.strftime("%H:%M") if h.hora_inicio else None,
                        "hora_fin": h.hora_fin.strftime("%H:%M") if h.hora_fin else None,
                        "aula": h.aula,
                    }
                    for h in horarios
                ],
            })

        return resultado, None

    @staticmethod
    def cargar_silabo(usuario_id, seccion_curso_id, nombre_archivo, archivo_stream):
        docente = Docente.query.filter_by(usuario_id=usuario_id).first()
        if not docente:
            return None, "No se encontro un docente asociado a este usuario", 404

        asignado = SeccionDocente.query.filter_by(
            seccion_curso_id=seccion_curso_id,
            docente_id=docente.id
        ).first()
        if not asignado:
            return None, "No tienes asignado este curso, no puedes cargar el silabo", 403

        extension = os.path.splitext(nombre_archivo)[1].lower()
        if extension != ".pdf":
            return None, "Formato no valido. Solo se permiten documentos en formato PDF", 400

        archivo_stream.seek(0, os.SEEK_END)
        tamano = archivo_stream.tell()
        archivo_stream.seek(0)
        if tamano > TAMANO_MAXIMO_SILABO_BYTES:
            return None, "El archivo supera el tamano maximo permitido de 10 MB", 413

        os.makedirs(CARPETA_SILABOS, exist_ok=True)
        nombre_unico = f"silabo_{seccion_curso_id}_{uuid.uuid4()}{extension}"
        ruta_completa = os.path.join(CARPETA_SILABOS, nombre_unico)
        archivo_stream.save(ruta_completa)

        silabo = Silabo.query.filter_by(seccion_curso_id=seccion_curso_id).first()
        if silabo:
            silabo.nombre_archivo = nombre_archivo
            silabo.ruta_archivo = ruta_completa
            silabo.subido_en = datetime.utcnow()
        else:
            silabo = Silabo(
                seccion_curso_id=seccion_curso_id,
                nombre_archivo=nombre_archivo,
                ruta_archivo=ruta_completa
            )
            db.session.add(silabo)

        db.session.commit()
        return silabo, None, 201

    @staticmethod
    def obtener_silabo(seccion_curso_id):
        silabo = Silabo.query.filter_by(seccion_curso_id=seccion_curso_id).first()
        if not silabo:
            return None, "No hay silabo cargado para este curso"
        return silabo, None

    @staticmethod
    def asignar_docente(seccion_curso_id, docente_id, horas_asignadas, tipo_docente_id=None):
        seccion = SeccionCurso.query.get(seccion_curso_id)
        if not seccion:
            return None, "Seccion no encontrada", 404

        if not isinstance(horas_asignadas, int) or horas_asignadas <= 0:
            return None, "Las horas asignadas deben ser un numero entero positivo", 422

        existente = SeccionDocente.query.filter_by(
            seccion_curso_id=seccion_curso_id,
            docente_id=docente_id,
        ).first()
        if existente:
            return None, "Este docente ya esta asignado a esta seccion", 409

        asignacion = SeccionDocente(
            seccion_curso_id=seccion_curso_id,
            docente_id=docente_id,
            tipo_docente_id=tipo_docente_id,
            horas_asignadas=horas_asignadas,
        )
        db.session.add(asignacion)
        db.session.commit()

        return {"id": asignacion.id}, None, 201

    @staticmethod
    def gestionar_horario(seccion_curso_id, dia, hora_inicio, hora_fin, aula):
        seccion = SeccionCurso.query.get(seccion_curso_id)
        if not seccion:
            return None, "Seccion no encontrada", 404

        if hora_fin <= hora_inicio:
            return None, "La hora de fin debe ser posterior a la hora de inicio", 400

        colision_aula = (
            SeccionHorario.query
            .filter(
                SeccionHorario.aula == aula,
                SeccionHorario.dia == dia,
                SeccionHorario.hora_inicio < hora_fin,
                SeccionHorario.hora_fin > hora_inicio,
            )
            .join(SeccionCurso, SeccionHorario.seccion_curso_id == SeccionCurso.id)
            .first()
        )
        if colision_aula:
            nombre_curso_existente = colision_aula.seccion_curso.curso.nombre
            return None, (
                f"El aula seleccionada ya se encuentra asignada al curso {nombre_curso_existente} en ese horario"
            ), 409

        colision_seccion = (
            SeccionHorario.query
            .join(SeccionCurso, SeccionHorario.seccion_curso_id == SeccionCurso.id)
            .filter(
                SeccionCurso.semestre_id == seccion.semestre_id,
                SeccionCurso.periodo_academico_id == seccion.periodo_academico_id,
                SeccionHorario.dia == dia,
                SeccionHorario.hora_inicio < hora_fin,
                SeccionHorario.hora_fin > hora_inicio,
            )
            .first()
        )
        if colision_seccion:
            return None, "El grupo de estudiantes ya tiene una clase asignada en ese bloque horario", 409

        horario = SeccionHorario(
            seccion_curso_id=seccion_curso_id,
            dia=dia,
            hora_inicio=hora_inicio,
            hora_fin=hora_fin,
            aula=aula,
            estado="Activo",
        )
        db.session.add(horario)
        db.session.commit()

        return {"id": horario.id, "estado": horario.estado}, None, 201

    @staticmethod
    def _especialidad_por_docente(docente_id):
        curso_ids = (
            db.session.query(SeccionCurso.curso_id)
            .join(SeccionDocente, SeccionDocente.seccion_curso_id == SeccionCurso.id)
            .filter(SeccionDocente.docente_id == docente_id)
            .distinct()
            .all()
        )
        curso_ids = [c[0] for c in curso_ids]

        especialidad_ids = (
            db.session.query(PlanDeEstudios.especialidad_id)
            .join(PlanCursosSemestre, PlanCursosSemestre.plan_estudios_id == PlanDeEstudios.id)
            .filter(PlanCursosSemestre.curso_id.in_(curso_ids))
            .distinct()
            .all()
        )
        ids = [e[0] for e in especialidad_ids if e[0]]
        if not ids:
            return None

        especialidad = Especialidad.query.get(ids[0])
        return especialidad.nombre if especialidad else None

    @staticmethod
    def carga_docente(especialidad_id=None, periodo_academico_id=None):
        docentes = Docente.query.all()
        resultado = []

        for d in docentes:
            consulta = SeccionDocente.query.filter_by(docente_id=d.id).join(
                SeccionCurso, SeccionDocente.seccion_curso_id == SeccionCurso.id
            )
            if periodo_academico_id:
                consulta = consulta.filter(SeccionCurso.periodo_academico_id == periodo_academico_id)

            asignaciones = consulta.all()
            if not asignaciones:
                continue

            especialidad_nombre = CursosDocentesService._especialidad_por_docente(d.id)
            if especialidad_id:
                especialidades_docente = (
                    db.session.query(PlanDeEstudios.especialidad_id)
                    .join(PlanCursosSemestre, PlanCursosSemestre.plan_estudios_id == PlanDeEstudios.id)
                    .join(Curso, Curso.id == PlanCursosSemestre.curso_id)
                    .join(SeccionCurso, SeccionCurso.curso_id == Curso.id)
                    .join(SeccionDocente, SeccionDocente.seccion_curso_id == SeccionCurso.id)
                    .filter(SeccionDocente.docente_id == d.id)
                    .distinct()
                    .all()
                )
                ids_especialidad_docente = {e[0] for e in especialidades_docente}
                if int(especialidad_id) not in ids_especialidad_docente:
                    continue

            total_horas = sum(a.horas_asignadas or 0 for a in asignaciones)

            if total_horas < CARGA_MINIMA_SEMANAL:
                categoria = "Carga Incompleta"
            elif total_horas > CARGA_MAXIMA_SEMANAL:
                categoria = "Sobrecarga Laboral"
            else:
                categoria = "Carga Regular"

            resultado.append({
                "docente_id": d.id,
                "nombres": d.nombres,
                "apellido_paterno": d.apellido_paterno,
                "apellido_materno": d.apellido_materno,
                "especialidad": especialidad_nombre,
                "total_horas_semanales": total_horas,
                "categoria": categoria,
                "detalle_cursos": [
                    {
                        "curso_nombre": a.seccion_curso.curso.nombre,
                        "horas_asignadas": a.horas_asignadas,
                    }
                    for a in asignaciones
                ],
            })

        return resultado

    @staticmethod
    def cumplimiento_silabos(periodo_academico_id=None):
        if not periodo_academico_id:
            periodo = CursosDocentesService.periodo_activo()
            periodo_academico_id = periodo.id if periodo else None

        secciones = SeccionCurso.query.filter_by(periodo_academico_id=periodo_academico_id).all()

        total_cursos = len(secciones)
        total_cargados = 0
        pendientes = []
        por_especialidad = {}

        for seccion in secciones:
            silabo = Silabo.query.filter_by(seccion_curso_id=seccion.id).first()

            especialidad_ids = (
                db.session.query(PlanDeEstudios.especialidad_id)
                .join(PlanCursosSemestre, PlanCursosSemestre.plan_estudios_id == PlanDeEstudios.id)
                .filter(PlanCursosSemestre.curso_id == seccion.curso_id)
                .distinct()
                .all()
            )
            especialidad = Especialidad.query.get(especialidad_ids[0][0]) if especialidad_ids else None
            nombre_especialidad = especialidad.nombre if especialidad else "Sin especialidad"

            por_especialidad.setdefault(nombre_especialidad, {"total": 0, "cargados": 0})
            por_especialidad[nombre_especialidad]["total"] += 1

            if silabo:
                total_cargados += 1
                por_especialidad[nombre_especialidad]["cargados"] += 1
            else:
                docente_asignado = SeccionDocente.query.filter_by(seccion_curso_id=seccion.id).first()
                docente = docente_asignado.docente if docente_asignado else None
                pendientes.append({
                    "seccion_curso_id": seccion.id,
                    "curso_nombre": seccion.curso.nombre,
                    "especialidad": nombre_especialidad,
                    "docente_nombre": (
                        f"{docente.nombres} {docente.apellido_paterno}" if docente else "Sin docente asignado"
                    ),
                    "docente_correo": docente.correo_institucional if docente else None,
                })

        porcentaje_general = round((total_cargados / total_cursos) * 100, 1) if total_cursos else 0

        resumen_por_especialidad = [
            {
                "especialidad": nombre,
                "total_cursos": datos["total"],
                "cursos_cargados": datos["cargados"],
                "porcentaje": round((datos["cargados"] / datos["total"]) * 100, 1) if datos["total"] else 0,
            }
            for nombre, datos in por_especialidad.items()
        ]

        return {
            "porcentaje_general": porcentaje_general,
            "resumen_por_especialidad": resumen_por_especialidad,
            "cursos_pendientes": pendientes,
        }


def cumplimiento_plan_estudios(periodo_academico_id):
    cursos_del_plan = PlanCursosSemestre.query.all()

    resultado = []
    for item in cursos_del_plan:
        seccion = SeccionCurso.query.filter_by(
            periodo_academico_id=periodo_academico_id,
            curso_id=item.curso_id,
            semestre_id=item.semestre_id
        ).first()

        docentes_asignados = 0
        cupos = None
        if seccion:
            docentes_asignados = SeccionDocente.query.filter_by(
                seccion_curso_id=seccion.id
            ).count()
            cupos = seccion.cupos

        resultado.append({
            "plan_estudios_id": item.plan_estudios_id,
            "semestre_id": item.semestre_id,
            "curso_id": item.curso_id,
            "curso_nombre": item.curso.nombre,
            "tiene_oferta_este_periodo": seccion is not None,
            "docentes_asignados": docentes_asignados,
            "cupos": cupos
        })

    return resultado
