from flask import jsonify, request, send_file
from flask_jwt_extended import get_jwt_identity
from datetime import time as hora_cls
from app.modelos.curso import Curso
from app.modelos.pre_requisito import PreRequisito
from app.modelos.docente import Docente
from app.modelos.tipo_docente import TipoDocente
from app.modelos.seccion_curso import SeccionCurso
from app.modelos.seccion_docente import SeccionDocente
from app.modelos.seccion_horario import SeccionHorario
from app.modulos.cursos_docentes.services import CursosDocentesService
from app.modulos.cursos_docentes.services import cumplimiento_plan_estudios

DIAS_TEXTO = {
    "lunes": 1, "martes": 2, "miercoles": 3, "miércoles": 3,
    "jueves": 4, "viernes": 5, "sabado": 6, "sábado": 6, "domingo": 7,
}


def listar_cursos():
    cursos = Curso.query.all()
    return jsonify([
        {
            "id": c.id,
            "nombre": c.nombre,
            "codigo": c.codigo,
            "creditos": c.creditos,
            "horas_lectivas": c.horas_lectivas,
            "horas_practicas": c.horas_practicas
        }
        for c in cursos
    ])


def obtener_curso(id):
    c = Curso.query.get(id)
    if not c:
        return jsonify({"mensaje": "Curso no encontrado"}), 404
    return jsonify({
        "id": c.id,
        "nombre": c.nombre,
        "codigo": c.codigo,
        "creditos": c.creditos,
        "horas_lectivas": c.horas_lectivas,
        "horas_practicas": c.horas_practicas
    })


def crear_curso():
    data = request.get_json() or {}
    resultado, error, codigo = CursosDocentesService.crear_curso(
        nombre=data.get("nombre"),
        codigo=data.get("codigo"),
        creditos=data.get("creditos"),
        horas_lectivas=data.get("horas_lectivas"),
        horas_practicas=data.get("horas_practicas"),
    )
    if error:
        return jsonify({"error": error}), codigo
    return jsonify(resultado), codigo


def crear_seccion_curso():
    data = request.get_json() or {}
    resultado, error, codigo = CursosDocentesService.crear_seccion_curso(
        curso_id=data.get("curso_id"),
        periodo_academico_id=data.get("periodo_academico_id"),
        semestre_id=data.get("semestre_id"),
        cupos=data.get("cupos"),
    )
    if error:
        return jsonify({"error": error}), codigo
    return jsonify(resultado), codigo


def asignaciones_seccion(seccion_curso_id):
    resultado, error = CursosDocentesService.asignaciones_seccion(seccion_curso_id)
    if error:
        return jsonify({"error": error}), 404
    return jsonify(resultado)


def listar_prerequisitos():
    prerequisitos = PreRequisito.query.all()
    return jsonify([
        {
            "curso_dependiente_id": p.curso_dependiente_id,
            "curso_requisito_id": p.curso_requisito_id
        }
        for p in prerequisitos
    ])


def listar_docentes():
    docentes = Docente.query.filter(Docente.deleted_at.is_(None)).all()
    return jsonify([
        {
            "id": d.id,
            "nombres": d.nombres,
            "apellido_paterno": d.apellido_paterno,
            "apellido_materno": d.apellido_materno,
            "correo_institucional": d.correo_institucional
        }
        for d in docentes
    ])


def listar_tipos_docentes():
    tipos = TipoDocente.query.all()
    return jsonify([
        {"id": t.id, "nombre": t.nombre}
        for t in tipos
    ])


def mis_cursos_asignados():
    usuario_id = int(get_jwt_identity())
    periodo_academico_id = request.args.get("periodo_academico_id", type=int)
    resultado, error = CursosDocentesService.mis_cursos(usuario_id, periodo_academico_id)
    if error:
        return jsonify({"error": error}), 404
    return jsonify(resultado)


def periodos_historicos_docente():
    usuario_id = int(get_jwt_identity())
    periodos, error = CursosDocentesService.periodos_historicos_docente(usuario_id)
    if error:
        return jsonify({"error": error}), 404
    return jsonify(periodos)


def asignar_docente(seccion_curso_id):
    data = request.get_json()
    docente_id = data.get("docente_id")
    tipo_docente_id = data.get("tipo_docente_id")
    horas_asignadas = data.get("horas_asignadas")
    resultado, error, codigo = CursosDocentesService.asignar_docente(
        seccion_curso_id=seccion_curso_id,
        docente_id=docente_id,
        horas_asignadas=horas_asignadas,
        tipo_docente_id=tipo_docente_id,
    )
    if error:
        return jsonify({"error": error}), codigo
    return jsonify(resultado), codigo


def gestionar_horario(seccion_curso_id):
    data = request.get_json()
    dia_ingresado = data.get("dia")
    if isinstance(dia_ingresado, int):
        dia = dia_ingresado
    else:
        dia_normalizado = str(dia_ingresado).strip().lower()
        dia = int(dia_normalizado) if dia_normalizado.isdigit() else DIAS_TEXTO.get(dia_normalizado)
    if dia is None:
        return jsonify({"error": "Dia invalido"}), 400
    try:
        hora_inicio = hora_cls.fromisoformat(str(data.get("hora_inicio")))
        hora_fin = hora_cls.fromisoformat(str(data.get("hora_fin")))
    except (TypeError, ValueError):
        return jsonify({"error": "Formato de hora invalido"}), 400
    aula = data.get("aula")
    if not aula:
        return jsonify({"error": "Debes indicar el aula o el enlace virtual"}), 400
    resultado, error, codigo = CursosDocentesService.gestionar_horario(
        seccion_curso_id=seccion_curso_id,
        dia=dia,
        hora_inicio=hora_inicio,
        hora_fin=hora_fin,
        aula=aula,
    )
    if error:
        return jsonify({"error": error}), codigo
    return jsonify(resultado), codigo


def listar_asignaciones_secciones():
    secciones = SeccionCurso.query.all()
    resultado = []
    for s in secciones:
        curso = Curso.query.get(s.curso_id)
        asignaciones = SeccionDocente.query.filter_by(seccion_curso_id=s.id).all()
        horarios = SeccionHorario.query.filter_by(seccion_curso_id=s.id).all()
        resultado.append({
            "id": s.id,
            "curso_id": s.curso_id,
            "curso_nombre": curso.nombre if curso else "—",
            "semestre_id": s.semestre_id,
            "periodo_academico_id": s.periodo_academico_id,
            "cupos": s.cupos,
            "docentes": [
                {
                    "id": a.id,
                    "docente_id": a.docente_id,
                    "docente_nombre": f"{a.docente.nombres} {a.docente.apellido_paterno}" if a.docente else "—",
                    "tipo": a.tipo_docente.nombre if a.tipo_docente else "—",
                }
                for a in asignaciones
            ],
            "horarios": [
                {
                    "id": h.id,
                    "dia": h.dia,
                    "hora_inicio": str(h.hora_inicio),
                    "hora_fin": str(h.hora_fin),
                }
                for h in horarios
            ],
        })
    return jsonify(resultado)


def carga_docente():
    especialidad_id = request.args.get("especialidad_id", type=int)
    periodo_academico_id = request.args.get("periodo_academico_id", type=int)
    resultado = CursosDocentesService.carga_docente(especialidad_id, periodo_academico_id)
    return jsonify(resultado)


def cargar_silabo(seccion_curso_id):
    usuario_id = int(get_jwt_identity())
    if "archivo" not in request.files:
        return jsonify({"error": "Debes adjuntar un archivo"}), 400
    archivo = request.files["archivo"]
    silabo, error, codigo = CursosDocentesService.cargar_silabo(
        usuario_id=usuario_id,
        seccion_curso_id=seccion_curso_id,
        nombre_archivo=archivo.filename,
        archivo_stream=archivo
    )
    if error:
        return jsonify({"error": error}), codigo
    return jsonify({"mensaje": "Silabo cargado correctamente", "nombre_archivo": silabo.nombre_archivo}), codigo


def descargar_silabo(seccion_curso_id):
    silabo, error = CursosDocentesService.obtener_silabo(seccion_curso_id)
    if error:
        return jsonify({"error": error}), 404
    return send_file(silabo.ruta_archivo, as_attachment=True, download_name=silabo.nombre_archivo)


def cumplimiento_silabos():
    periodo_academico_id = request.args.get("periodo_academico_id", type=int)
    resultado = CursosDocentesService.cumplimiento_silabos(periodo_academico_id)
    return jsonify(resultado)


def evaluar_cumplimiento_plan():
    periodo_academico_id = request.args.get("periodo_academico_id", type=int)
    if not periodo_academico_id:
        return jsonify({"error": "Debes indicar periodo_academico_id como parametro"}), 400
    resultado = cumplimiento_plan_estudios(periodo_academico_id)
    return jsonify(resultado)
