from datetime import datetime
from app import db
from app.modelos.matricula_detalle import MatriculaDetalle
from app.modelos.docente import Docente
from app.modelos.seccion_curso import SeccionCurso
from app.modelos.seccion_docente import SeccionDocente
from app.modelos.acta import Acta
from app.modelos.estudiante import Estudiante
from app.modelos.auditoria import Auditoria
from app.modelos.historial_merito import HistorialMerito


class NotasService:

    @staticmethod
    def _tiene_acceso_a_seccion(docente_id, seccion_curso_id):
        return SeccionDocente.query.filter_by(
            docente_id=docente_id,
            seccion_curso_id=seccion_curso_id
        ).first() is not None

    @staticmethod
    def mis_cursos_con_notas(usuario_id):
        docente = Docente.query.filter_by(usuario_id=usuario_id).first()
        if not docente:
            return None, "No se encontro un docente asociado a este usuario"

        asignaciones = SeccionDocente.query.filter_by(docente_id=docente.id).all()
        resultado = []
        for a in asignaciones:
            seccion = db.session.get(SeccionCurso, a.seccion_curso_id)
            if not seccion:
                continue
            alumnos = []
            for md in MatriculaDetalle.query.filter_by(seccion_curso_id=seccion.id).all():
                estudiante = db.session.get(Estudiante, md.matricula.estudiante_id) if md.matricula else None
                alumnos.append({
                    "matricula_id": md.matricula_id,
                    "estudiante_nombre": f"{estudiante.nombres} {estudiante.apellido_paterno}" if estudiante else "—",
                    "nota_parcial": float(md.nota_parcial) if md.nota_parcial is not None else None,
                    "nota_final": float(md.nota_final) if md.nota_final is not None else None,
                    "estado_curso_id": md.estado_curso_id,
                })
            acta = Acta.query.filter_by(seccion_curso_id=seccion.id).first()
            resultado.append({
                "seccion_curso_id": seccion.id,
                "curso_nombre": seccion.curso.nombre if seccion.curso else "—",
                "alumnos": alumnos,
                "acta_cerrada": acta.estado == "Cerrada" if acta else False,
            })

        return resultado, None

    @staticmethod
    def registrar_nota(usuario_id, matricula_id, seccion_curso_id,
                       nota_parcial=None, nota_final=None, estado_curso_id=None):
        docente = Docente.query.filter_by(usuario_id=usuario_id).first()
        if not docente:
            return None, "No se encontro un docente asociado a este usuario", 404

        if not NotasService._tiene_acceso_a_seccion(docente.id, seccion_curso_id):
            return None, "No tienes permiso para registrar notas en esta seccion", 403

        seccion = db.session.get(SeccionCurso, seccion_curso_id)
        if not seccion:
            return None, "Seccion no encontrada", 404

        acta = Acta.query.filter_by(seccion_curso_id=seccion.id).first()
        if acta and acta.estado == "Cerrada":
            return None, "No se pueden modificar notas porque el acta ya esta cerrada", 400

        detalle = MatriculaDetalle.query.filter_by(
            matricula_id=matricula_id,
            seccion_curso_id=seccion_curso_id
        ).first()
        if not detalle:
            return None, "No se encontro la matricula para esta seccion", 404

        if detalle.matricula and detalle.matricula.estado and detalle.matricula.estado.nombre == "Oficializado":
            return None, "Bloqueo de seguridad: No se pueden alterar calificaciones de una matrícula oficializada.", 403

        cambios = []
        if nota_parcial is not None:
            detalle.nota_parcial = nota_parcial
            cambios.append(f"parcial={nota_parcial}")
        if nota_final is not None:
            detalle.nota_final = nota_final
            cambios.append(f"final={nota_final}")
        if estado_curso_id:
            detalle.estado_curso_id = estado_curso_id
            from app.modelos.estado_curso import EstadoCurso
            estado = db.session.get(EstadoCurso, estado_curso_id)
            if estado:
                cambios.append(f"estado={estado.nombre}")

        Auditoria.registrar(
            usuario_id=usuario_id,
            accion="registrar_nota",
            detalle=f"matricula #{matricula_id}, seccion #{seccion_curso_id}: {'; '.join(cambios)}"
        )

        db.session.commit()
        return {"matricula_id": matricula_id, "seccion_curso_id": seccion_curso_id}, None, 200

    @staticmethod
    def obtener_hoja_notas(usuario_id, semestre_id=None):
        estudiante = Estudiante.query.filter_by(usuario_id=usuario_id).first()
        if not estudiante:
            return None, "Este usuario no tiene perfil de estudiante"

        query = MatriculaDetalle.query.join(
            MatriculaDetalle.matricula
        ).filter(
            MatriculaDetalle.matricula.has(estudiante_id=estudiante.id)
        )

        detalles = query.order_by(MatriculaDetalle.matricula_id).all()

        historial = []
        for d in detalles:
            matricula = d.matricula
            if semestre_id and matricula.semestre_id != semestre_id:
                continue
            historial.append({
                "periodo_academico_id": matricula.periodo_academico_id,
                "periodo_academico_nombre": matricula.periodo_academico.nombre if matricula.periodo_academico else None,
                "semestre_codigo": matricula.semestre.codigo if matricula.semestre else None,
                "curso_nombre": d.seccion_curso.curso.nombre if d.seccion_curso.curso else "—",
                "nota_parcial": float(d.nota_parcial) if d.nota_parcial is not None else None,
                "nota_final": float(d.nota_final) if d.nota_final is not None else None,
                "estado_nombre": d.estado_curso.nombre if d.estado_curso else None,
            })

        progreso_actual = None
        if estudiante.progreso:
            p = estudiante.progreso[0]
            progreso_actual = {
                "creditos_aprobados_acumulados": p.creditos_aprobados_acumulados,
                "promedio_ponderado_acumulado": float(p.promedio_ponderado_acumulado) if p.promedio_ponderado_acumulado else None,
                "estado_permanencia_id": p.estado_permanencia.nombre if p.estado_permanencia else None,
            }

        return {
            "historial": historial,
            "progreso_actual": progreso_actual,
        }, None

    @staticmethod
    def indicadores_academicos():
        total_evaluados = MatriculaDetalle.query.filter(
            MatriculaDetalle.nota_final.isnot(None)
        ).count()

        aprobados = 0
        reprobados = 0
        suma_notas = 0
        nota_count = 0

        for d in MatriculaDetalle.query.filter(MatriculaDetalle.nota_final.isnot(None)).all():
            if d.estado_curso and d.estado_curso.nombre.lower() == "aprobado":
                aprobados += 1
            elif d.estado_curso and d.estado_curso.nombre.lower() == "desaprobado":
                reprobados += 1

            nota = d.nota_final
            if nota is not None:
                suma_notas += float(nota)
                nota_count += 1

        promedio_general = round(suma_notas / nota_count, 2) if nota_count else None

        return {
            "promedio_general": promedio_general,
            "aprobados": aprobados,
            "reprobados": reprobados,
            "total_evaluados": total_evaluados,
        }, None
