import random
from datetime import datetime, date, time
from app import db, bcrypt
from app.modelos.usuario import Usuario
from app.modelos.estudiante import Estudiante
from app.modelos.docente import Docente
from app.modelos.especialidad import Especialidad
from app.modelos.curso import Curso
from app.modelos.seccion_curso import SeccionCurso
from app.modelos.seccion_horario import SeccionHorario
from app.modelos.seccion_docente import SeccionDocente
from app.modelos.matricula import Matricula
from app.modelos.matricula_detalle import MatriculaDetalle
from app.modelos.estado_matricula import EstadoMatricula
from app.modelos.estado_curso import EstadoCurso
from app.modelos.pago import Pago
from app.modelos.certificado import Certificado
from app.modelos.auditoria import Auditoria
from app.modelos.periodo_academico import PeriodoAcademico
from app.modelos.semestre import Semestre
from app.modelos.plan_de_estudios import PlanDeEstudios
from app.modelos.plan_estudiante import PlanEstudiante
from app.modelos.plan_cursos_semestre import PlanCursosSemestre

def ejecutar():
    print("Iniciando seeder de datos de demostración detallados...")
    
    # 1. Crear periodos académicos pasados y el actual
    periodos = [
        PeriodoAcademico(nombre="2025-I", fecha_inicio=date(2025, 3, 15), fecha_fin=date(2025, 7, 20)),
        PeriodoAcademico(nombre="2025-II", fecha_inicio=date(2025, 8, 15), fecha_fin=date(2025, 12, 20)),
    ]
    for p in periodos:
        if not PeriodoAcademico.query.filter_by(nombre=p.nombre).first():
            db.session.add(p)
    db.session.commit()
    
    # Periodo académico actual y pasados
    p_actual = PeriodoAcademico.query.order_by(PeriodoAcademico.fecha_inicio.desc()).first()
    p_2025_1 = PeriodoAcademico.query.filter_by(nombre="2025-I").first()
    p_2025_2 = PeriodoAcademico.query.filter_by(nombre="2025-II").first()
    
    # 2. Agregar más cursos
    nuevos_cursos_data = [
        ("Matemática I", "MAT1", 4, 3, 2),
        ("Física I", "FIS1", 4, 3, 2),
        ("Algoritmos y Estructura de Datos", "ALGO1", 4, 3, 2),
        ("Ingeniería de Requisitos", "REQ1", 3, 2, 2),
        ("Base de Datos II", "BD2", 4, 3, 2),
        ("Arquitectura de Software", "ARQ1", 4, 3, 2),
        ("Calidad de Software", "CAL1", 3, 2, 2),
        ("Proyecto de Tesis I", "TESIS1", 4, 2, 4)
    ]
    
    cursos_dict = {}
    for nombre, codigo, creds, hl, hp in nuevos_cursos_data:
        curso = Curso.query.filter_by(codigo=codigo).first()
        if not curso:
            curso = Curso(nombre=nombre, codigo=codigo, creditos=creds, horas_lectivas=hl, horas_practicas=hp)
            db.session.add(curso)
            db.session.flush()
        cursos_dict[codigo] = curso
        
    db.session.commit()
    
    # Obtener cursos que ya existían
    prog1 = Curso.query.filter_by(codigo="PROG1").first()
    bd1 = Curso.query.filter_by(codigo="BD1").first()
    redes = Curso.query.filter_by(codigo="RED1").first()
    if prog1: cursos_dict["PROG1"] = prog1
    if bd1: cursos_dict["BD1"] = bd1
    if redes: cursos_dict["RED1"] = redes
    
    # 3. Vincular los nuevos cursos a los planes de estudio
    plan_software = PlanDeEstudios.query.first() # Plan de Ingeniería de Software
    semestres = Semestre.query.order_by(Semestre.id).all()
    
    if plan_software and len(semestres) >= 4:
        # Asignar cursos a semestres en el plan de estudios
        plan_cursos = [
            (semestres[0].id, "MAT1"),
            (semestres[0].id, "PROG1"),
            (semestres[1].id, "FIS1"),
            (semestres[1].id, "ALGO1"),
            (semestres[2].id, "BD1"),
            (semestres[2].id, "REQ1"),
            (semestres[3].id, "BD2"),
            (semestres[3].id, "ARQ1"),
            (semestres[3].id, "CAL1"),
        ]
        for sem_id, cod in plan_cursos:
            curso = cursos_dict.get(cod)
            if curso:
                existe = PlanCursosSemestre.query.filter_by(
                    plan_estudios_id=plan_software.id,
                    semestre_id=sem_id,
                    curso_id=curso.id
                ).first()
                if not existe:
                    db.session.add(PlanCursosSemestre(
                        plan_estudios_id=plan_software.id,
                        semestre_id=sem_id,
                        curso_id=curso.id
                    ))
        db.session.commit()

    # 4. Crear más estudiantes y vincularlos
    especialidad = Especialidad.query.first() # Software
    estudiantes_adicionales = [
        ("alberto.ruiz", "Alberto", "Ruiz", "Mendoza", "87654321", "alberto.ruiz@universidad.edu.pe"),
        ("diana.ortega", "Diana Carolina", "Ortega", "Salas", "87654322", "diana.ortega@universidad.edu.pe"),
        ("enrique.vega", "Enrique", "Vega", "Rojas", "87654323", "enrique.vega@universidad.edu.pe"),
        ("gabriela.paz", "Gabriela", "Paz", "Lozano", "87654324", "gabriela.paz@universidad.edu.pe"),
        ("hugo.sanchez", "Hugo", "Sanchez", "Flores", "87654325", "hugo.sanchez@universidad.edu.pe"),
        ("isabel.castro", "Isabel Marina", "Castro", "Vera", "87654326", "isabel.castro@universidad.edu.pe"),
        ("javier.munoz", "Javier", "Muñoz", "Díaz", "87654327", "javier.munoz@universidad.edu.pe"),
        ("karla.guzman", "Karla", "Guzmán", "Reyes", "87654328", "karla.guzman@universidad.edu.pe"),
        ("luis.peña", "Luis Angel", "Peña", "Torres", "87654329", "luis.pena@universidad.edu.pe"),
        ("monica.rios", "Mónica", "Ríos", "Villanueva", "87654330", "monica.rios@universidad.edu.pe")
    ]
    
    lista_estudiantes = []
    for username, nombres, pat, mat, dni, correo in estudiantes_adicionales:
        usuario = Usuario.query.filter_by(username=username).first()
        if not usuario:
            usuario = Usuario(
                username=username,
                password=bcrypt.generate_password_hash("123456").decode("utf-8"),
                rol="estudiante"
            )
            db.session.add(usuario)
            db.session.flush()
            
        estudiante = Estudiante.query.filter_by(dni=dni).first()
        if not estudiante:
            estudiante = Estudiante(
                usuario_id=usuario.id,
                especialidad_id=especialidad.id if especialidad else 1,
                nombres=nombres,
                apellido_paterno=pat,
                apellido_materno=mat,
                dni=dni,
                correo_institucional=correo,
                tiene_deuda_activa=False,
                tiene_sancion_activa=False
            )
            db.session.add(estudiante)
            db.session.flush()
            
            # Asociar estudiante al plan de estudios
            if plan_software:
                db.session.add(PlanEstudiante(
                    estudiante_id=estudiante.id,
                    plan_estudios_id=plan_software.id,
                    created_at=datetime.utcnow()
                ))
        lista_estudiantes.append(estudiante)
        
    db.session.commit()
    
    estado_mat_registrado = EstadoMatricula.query.filter_by(nombre="Matriculado").first()
    estado_mat_pendiente = EstadoMatricula.query.filter_by(nombre="Pendiente").first()
    estado_mat_observado = EstadoMatricula.query.filter_by(nombre="Retirado").first()
    
    estado_curso_aprobado = EstadoCurso.query.filter_by(nombre="Aprobado").first()
    estado_curso_reprobado = EstadoCurso.query.filter_by(nombre="Desaprobado").first()
    estado_curso_cursa = EstadoCurso.query.filter_by(nombre="Cursando").first()
    
    # 6. Crear secciones y asignarlas para periodos pasados (2025-I, 2025-II) y el periodo actual (2026-I)
    docente1 = Docente.query.first() # docente1_prueba
    docente2 = Docente.query.offset(1).first() # docente2_prueba
    
    # Secciones para periodo actual
    secciones_actuales_dict = {}
    for cod_curso in ["MAT1", "PROG1", "FIS1", "ALGO1", "BD1", "REQ1", "BD2", "ARQ1"]:
        curso = cursos_dict.get(cod_curso)
        if not curso: continue
        
        seccion = SeccionCurso.query.filter_by(
            curso_id=curso.id,
            periodo_academico_id=p_actual.id
        ).first()
        
        if not seccion:
            seccion = SeccionCurso(
                curso_id=curso.id,
                semestre_id=semestres[0].id,
                periodo_academico_id=p_actual.id,
                cupos=30
            )
            db.session.add(seccion)
            db.session.flush()
            
            # Crear horario
            db.session.add(SeccionHorario(
                seccion_curso_id=seccion.id,
                dia=1 if random.choice([True, False]) else 3,
                hora_inicio=time(8, 0),
                hora_fin=time(10, 0),
                aula="Aula A-101"
            ))
            
        # Asignar docente si no está asignado
        seccion_doc = SeccionDocente.query.filter_by(seccion_curso_id=seccion.id).first()
        if not seccion_doc:
            docente = docente1 if cod_curso in ["MAT1", "FIS1", "BD1", "REQ1"] else docente2
            if docente:
                db.session.add(SeccionDocente(
                    seccion_curso_id=seccion.id,
                    docente_id=docente.id,
                    horas_asignadas=4
                ))
        secciones_actuales_dict[cod_curso] = seccion
        
    db.session.commit()
    
    # 7. Crear historial académico pasado (Kardex) para estudiantes
    # Matriculamos a los estudiantes en periodos pasados y les ponemos notas aprobatorias o desaprobatorias
    for i, estudiante in enumerate(lista_estudiantes):
        # Historial de 2025-I
        if p_2025_1:
            matricula_pasada = Matricula(
                estudiante_id=estudiante.id,
                periodo_academico_id=p_2025_1.id,
                semestre_id=semestres[0].id,
                estado_id=estado_mat_registrado.id,
                pagado=True,
                created_at=datetime(2025, 3, 1)
            )
            db.session.add(matricula_pasada)
            db.session.flush()
            
            # Cursos del 2025-I: MAT1 y PROG1
            for cod in ["MAT1", "PROG1"]:
                curso = cursos_dict.get(cod)
                if not curso: continue
                # Crear seccion historica si no existe
                seccion_hist = SeccionCurso.query.filter_by(
                    curso_id=curso.id,
                    semestre_id=semestres[0].id,
                    periodo_academico_id=p_2025_1.id
                ).first()
                if not seccion_hist:
                    seccion_hist = SeccionCurso(
                        curso_id=curso.id,
                        semestre_id=semestres[0].id,
                        periodo_academico_id=p_2025_1.id,
                        cupos=30
                    )
                    db.session.add(seccion_hist)
                    db.session.flush()
                
                # Nota aprobatoria
                nota = round(random.uniform(11.0, 19.5), 2)
                db.session.add(MatriculaDetalle(
                    matricula_id=matricula_pasada.id,
                    seccion_curso_id=seccion_hist.id,
                    nota_parcial=nota,
                    nota_parcial2=nota,
                    nota_practica=nota,
                    nota_final=nota,
                    estado_curso_id=estado_curso_aprobado.id
                ))
                
        # Historial de 2025-II
        if p_2025_2:
            matricula_pasada2 = Matricula(
                estudiante_id=estudiante.id,
                periodo_academico_id=p_2025_2.id,
                semestre_id=semestres[0].id,
                estado_id=estado_mat_registrado.id,
                pagado=True,
                created_at=datetime(2025, 8, 1)
            )
            db.session.add(matricula_pasada2)
            db.session.flush()
            
            # Cursos del 2025-II: FIS1 y ALGO1
            for cod in ["FIS1", "ALGO1"]:
                curso = cursos_dict.get(cod)
                if not curso: continue
                seccion_hist = SeccionCurso.query.filter_by(
                    curso_id=curso.id,
                    semestre_id=semestres[0].id,
                    periodo_academico_id=p_2025_2.id
                ).first()
                if not seccion_hist:
                    seccion_hist = SeccionCurso(
                        curso_id=curso.id,
                        semestre_id=semestres[0].id,
                        periodo_academico_id=p_2025_2.id,
                        cupos=30
                    )
                    db.session.add(seccion_hist)
                    db.session.flush()
                
                # Algunos alumnos aprueban y otros jalan Física
                nota = round(random.uniform(8.0, 18.0), 2) if cod == "FIS1" and i % 3 == 0 else round(random.uniform(12.0, 19.0), 2)
                est_curso = estado_curso_aprobado if nota >= 10.5 else estado_curso_reprobado
                db.session.add(MatriculaDetalle(
                    matricula_id=matricula_pasada2.id,
                    seccion_curso_id=seccion_hist.id,
                    nota_parcial=nota,
                    nota_parcial2=nota,
                    nota_practica=nota,
                    nota_final=nota,
                    estado_curso_id=est_curso.id
                ))
    db.session.commit()
    
    # 8. Matrículas activas (2026-I) en diferentes estados
    # Registramos matrículas activas para los estudiantes de demostración
    for i, estudiante in enumerate(lista_estudiantes):
        # Determinar estado de la matrícula activa
        if i % 3 == 0:
            estado_mat = estado_mat_registrado # Registrado / Aprobado
        elif i % 3 == 1:
            estado_mat = estado_mat_pendiente # Pendiente de validación por Dirección
        else:
            estado_mat = estado_mat_observado # Observado por falta de pago u otra razón
            
        m_activa = Matricula(
            estudiante_id=estudiante.id,
            periodo_academico_id=p_actual.id,
            semestre_id=semestres[0].id,
            estado_id=estado_mat.id,
            pagado=(estado_mat == estado_mat_registrado),
            created_at=datetime.utcnow()
        )
        db.session.add(m_activa)
        db.session.flush()
        
        # Pagos asociados
        if estado_mat in [estado_mat_registrado, estado_mat_pendiente]:
            db.session.add(Pago(
                matricula_id=m_activa.id,
                numero_operacion=f"OP-2026-{estudiante.id:04d}",
                fecha_pago=date(2026, 3, 10),
                monto=500.00,
                comprobante_ruta=f"vouchers/pago_{estudiante.id}.pdf",
                comprobante_nombre_original="voucher.pdf"
            ))
            
        # Asignar detalles de cursos en la matrícula
        # Alumnos llevan las materias de docente1 (PROG1, MAT1, FIS1, REQ1) + asignaturas complementarias
        cursos_lleva = ["PROG1", "MAT1", "FIS1", "REQ1", "BD1", "ARQ1"]
            
        for cod in cursos_lleva:
            seccion = secciones_actuales_dict.get(cod)
            if not seccion: continue
            
            # Si ya está registrado (aprobado), puede tener algunas notas ya ingresadas por el profesor
            np = round(random.uniform(10.0, 18.0), 2) if estado_mat == estado_mat_registrado else None
            np2 = round(random.uniform(11.0, 19.0), 2) if (estado_mat == estado_mat_registrado and i % 2 == 0) else None
            nprac = round(random.uniform(12.0, 17.5), 2) if estado_mat == estado_mat_registrado else None
            
            # Calcular nota final si tiene todas
            nf = round((np + np2 + nprac) / 3, 2) if (np and np2 and nprac) else None
            est_c = estado_curso_cursa
            if nf:
                est_c = estado_curso_aprobado if nf >= 10.5 else estado_curso_reprobado
                
            db.session.add(MatriculaDetalle(
                matricula_id=m_activa.id,
                seccion_curso_id=seccion.id,
                nota_parcial=np,
                nota_parcial2=np2,
                nota_practica=nprac,
                nota_final=nf,
                estado_curso_id=est_c.id
            ))
            
            # Reducir cupos disponibles
            seccion.cupos -= 1
            
    db.session.commit()
    
    # 9. Crear Certificados
    # Algunos alumnos tienen solicitudes de certificados
    certificados_data = [
        (lista_estudiantes[0], "Constancia de estudios", "Pendiente de Validación", "TCK-2026-001"),
        (lista_estudiantes[0], "Constancia de matricula", "Autorizado por Dirección", "TCK-2026-002"),
        (lista_estudiantes[0], "Certificado de notas", "Emitido", "TCK-2026-003"),
        (lista_estudiantes[1], "Certificado de notas", "Emitido", "TCK-2026-004"),
        (lista_estudiantes[2], "Constancia de estudios", "Rechazado", "TCK-2026-005"),
        (lista_estudiantes[3], "Record academico", "Pendiente de Validación", "TCK-2026-006"),
        (lista_estudiantes[4], "Certificado de notas", "Emitido", "TCK-2026-007")
    ]
    
    for est, tipo, estado, ticket in certificados_data:
        cert = Certificado.query.filter_by(ticket_codigo=ticket).first()
        if not cert:
            cert = Certificado(
                estudiante_id=est.id,
                tipo=tipo,
                ticket_codigo=ticket,
                estado=estado,
                comprobante_pago_ruta=f"vouchers/cert_{est.id}.pdf",
                motivo_rechazo="Pago inválido o incompleto" if estado == "Rechazado" else None,
                hash_documento="a3b5c6d7e8f90123456789abcdef" if estado == "Emitido" else None,
                fecha_firma=datetime.utcnow() if estado == "Emitido" else None,
                codigo_verificacion=f"verif-code-{est.id}-{ticket}"
            )
            db.session.add(cert)
            
    db.session.commit()
    
    # 10. Registrar Logs de Auditoría
    # Llenamos la tabla de auditoría con bastantes registros históricos para los dashboards
    auditores_usuarios = Usuario.query.filter(Usuario.rol.in_(["administrador", "direccion"])).all()
    if auditores_usuarios:
        u_admin = auditores_usuarios[0] # admin_prueba
        u_dir = next((u for u in auditores_usuarios if u.rol == "direccion"), u_admin) # direccion_prueba
        
        auditorias_mock = [
            (u_admin.id, "LOGIN_EXITOSO", "Usuario admin_prueba inició sesión desde IP 192.168.1.15"),
            (u_admin.id, "CREAR_USUARIO", "Se registró el nuevo usuario docente: docente_sistemas_5"),
            (u_admin.id, "ASIGNAR_DOCENTE", "Se asignó al docente Carlos Valdivia a la sección SEC_BD2_A"),
            (u_dir.id, "LOGIN_EXITOSO", "Usuario direccion_prueba inició sesión desde IP 192.168.1.20"),
            (u_dir.id, "APROBAR_MATRICULA", "Matrícula aprobada del estudiante Gomez Vargas, Maria Fernanda para el ciclo 2026-I"),
            (u_dir.id, "APROBAR_MATRICULA", "Matrícula aprobada del estudiante Ruiz Mendoza, Alberto para el ciclo 2026-I"),
            (u_admin.id, "REGISTRAR_HORARIO", "Se registró el horario Lunes 08:00 - 10:00 en Aula A-101 para SEC_MAT1_A"),
            (u_dir.id, "RECHAZAR_TRAMITE", "Se rechazó el trámite de Constancia de Estudios del alumno Vega Rojas, Enrique. Motivo: Voucher duplicado"),
            (u_admin.id, "MODIFICAR_NOTA", "Se rectificó la nota final del alumno Hernandez Paredes, Jose Luis en PROG1 de 10.00 a 11.00 por reclamo de examen"),
            (u_dir.id, "EMITIR_CERTIFICADO", "Se generó y firmó digitalmente el Récord de Notas del estudiante Salas Ortega, Diana"),
            (u_admin.id, "CERRAR_ACTA", "Cierre oficial del acta de calificaciones de la sección SEC_PROG1_2025_2"),
            (u_dir.id, "LOG_ESTADISTICAS", "Generación de reporte consolidado de rendimiento académico para Dirección del periodo 2025-II"),
            (u_admin.id, "SUSPENDER_USUARIO", "Se suspendió temporalmente la cuenta del usuario estudiante3_prueba por falta administrativa")
        ]
        
        for u_id, accion, detalle in auditorias_mock:
            db.session.add(Auditoria(
                usuario_id=u_id,
                accion=accion,
                detalle=detalle,
                created_at=datetime.utcnow()
            ))
        db.session.commit()

    print("Seeder de datos de demostración completado exitosamente.")
