from datetime import datetime
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from app import bcrypt
from app import db
from app.modelos.facultad import Facultad
from app.modelos.especialidad import Especialidad
from app.modelos.plan_de_estudios import PlanDeEstudios
from app.modelos.periodo_academico import PeriodoAcademico
from app.modelos.semestre import Semestre
from app.modelos.usuario import Usuario
from app.modelos.auditoria import Auditoria
from app.modelos.matricula import Matricula
from app.modelos.estudiante import Estudiante
from app.modelos.docente import Docente
from app.modelos.matricula_detalle import MatriculaDetalle
from app.modelos.certificado import Certificado


def listar_facultades():
    facultades = Facultad.query.all()
    return jsonify([
        {"id": f.id, "nombre": f.nombre}
        for f in facultades
    ])


def listar_especialidades():
    especialidades = Especialidad.query.all()
    return jsonify([
        {
            "id": e.id,
            "nombre": e.nombre,
            "facultad_id": e.facultad_id
        }
        for e in especialidades
    ])


def listar_planes_estudio():
    planes = PlanDeEstudios.query.all()
    return jsonify([
        {
            "id": p.id,
            "especialidad_id": p.especialidad_id,
            "anio_creacion": p.anio_creacion,
            "vigente": p.vigente
        }
        for p in planes
    ])


def listar_semestres():
    semestres = Semestre.query.all()
    return jsonify([
        {"id": s.id, "codigo": s.codigo}
        for s in semestres
    ])


def listar_periodos():
    periodos = PeriodoAcademico.query.order_by(PeriodoAcademico.fecha_inicio.desc()).all()
    return jsonify([
        {
            "id": p.id,
            "nombre": p.nombre,
            "fecha_inicio": p.fecha_inicio.isoformat() if p.fecha_inicio else None,
            "fecha_fin": p.fecha_fin.isoformat() if p.fecha_fin else None,
        }
        for p in periodos
    ])


def _datos_usuario(u):
    perfil = None
    if u.rol == "estudiante":
        est = Estudiante.query.filter_by(usuario_id=u.id).first()
        if est:
            perfil = {
                "nombres": est.nombres,
                "apellido_paterno": est.apellido_paterno,
                "apellido_materno": est.apellido_materno,
                "correo_institucional": est.correo_institucional,
                "especialidad_id": est.especialidad_id,
            }
    elif u.rol == "docente":
        doc = Docente.query.filter_by(usuario_id=u.id).first()
        if doc:
            perfil = {
                "nombres": doc.nombres,
                "apellido_paterno": doc.apellido_paterno,
                "apellido_materno": doc.apellido_materno,
                "correo_institucional": doc.correo_institucional,
            }
    return {
        "id": u.id,
        "username": u.username,
        "rol": u.rol,
        "activo": u.deleted_at is None,
        "perfil": perfil,
    }


def listar_usuarios():
    incluir_inactivos = request.args.get("incluir_inactivos", "").lower() == "true"
    query = Usuario.query
    if not incluir_inactivos:
        query = query.filter(Usuario.deleted_at.is_(None))
    usuarios = query.order_by(Usuario.id).all()
    return jsonify([_datos_usuario(u) for u in usuarios])


def detalle_usuario(usuario_id):
    usuario = db.session.get(Usuario, usuario_id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(_datos_usuario(usuario))


def crear_usuario():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "")
    rol = data.get("rol", "").strip()

    if not username or not password or not rol:
        return jsonify({"error": "Faltan campos requeridos: username, password, rol"}), 400

    roles_validos = ["estudiante", "docente", "administrador", "direccion"]
    if rol not in roles_validos:
        return jsonify({"error": f"Rol inválido. Debe ser uno de: {roles_validos}"}), 400

    if Usuario.query.filter_by(username=username).first():
        return jsonify({"error": "El nombre de usuario ya está en uso"}), 400

    if len(password) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400

    usuario = Usuario(
        username=username,
        password=bcrypt.generate_password_hash(password).decode("utf-8"),
        rol=rol,
        created_at=datetime.now(),
    )
    db.session.add(usuario)
    db.session.flush()

    mensaje_extra = None
    if rol == "estudiante":
        nombres = data.get("nombres", "").strip()
        apellido_paterno = data.get("apellido_paterno", "").strip()
        apellido_materno = data.get("apellido_materno", "").strip()
        correo_institucional = data.get("correo_institucional", "").strip()
        especialidad_id = data.get("especialidad_id")

        faltantes = []
        if not nombres: faltantes.append("nombres")
        if not apellido_paterno: faltantes.append("apellido_paterno")
        if not apellido_materno: faltantes.append("apellido_materno")
        if not correo_institucional: faltantes.append("correo_institucional")
        if not especialidad_id: faltantes.append("especialidad_id")
        if faltantes:
            db.session.rollback()
            return jsonify({"error": f"Faltan campos para estudiante: {faltantes}"}), 400

        estudiante = Estudiante(
            usuario_id=usuario.id,
            especialidad_id=especialidad_id,
            nombres=nombres,
            apellido_paterno=apellido_paterno,
            apellido_materno=apellido_materno,
            correo_institucional=correo_institucional,
        )
        db.session.add(estudiante)
        mensaje_extra = f"Perfil de estudiante creado (ID: {estudiante.id})"

    elif rol == "docente":
        nombres = data.get("nombres", "").strip()
        apellido_paterno = data.get("apellido_paterno", "").strip()
        apellido_materno = data.get("apellido_materno", "").strip()
        correo_institucional = data.get("correo_institucional", "").strip()

        faltantes = []
        if not nombres: faltantes.append("nombres")
        if not apellido_paterno: faltantes.append("apellido_paterno")
        if not apellido_materno: faltantes.append("apellido_materno")
        if not correo_institucional: faltantes.append("correo_institucional")
        if faltantes:
            db.session.rollback()
            return jsonify({"error": f"Faltan campos para docente: {faltantes}"}), 400

        docente = Docente(
            usuario_id=usuario.id,
            nombres=nombres,
            apellido_paterno=apellido_paterno,
            apellido_materno=apellido_materno,
            correo_institucional=correo_institucional,
        )
        db.session.add(docente)
        mensaje_extra = f"Perfil de docente creado (ID: {docente.id})"

    admin_id = int(get_jwt_identity())
    Auditoria.registrar(
        usuario_id=admin_id,
        accion="creacion_usuario",
        detalle=f"Creó usuario '{username}' con rol '{rol}'"
    )
    db.session.commit()

    return jsonify({
        "mensaje": f"Usuario '{username}' creado correctamente",
        "detalle": mensaje_extra,
        "usuario": _datos_usuario(usuario),
    }), 201


def toggle_usuario(usuario_id):
    admin_id = int(get_jwt_identity())
    if admin_id == usuario_id:
        return jsonify({"error": "No puedes desactivar tu propio usuario"}), 400

    usuario = db.session.get(Usuario, usuario_id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    if usuario.deleted_at is None:
        usuario.deleted_at = datetime.now()
        accion = "desactivacion_usuario"
        mensaje = f"Usuario '{usuario.username}' desactivado"
    else:
        usuario.deleted_at = None
        accion = "activacion_usuario"
        mensaje = f"Usuario '{usuario.username}' activado"

    Auditoria.registrar(
        usuario_id=admin_id,
        accion=accion,
        detalle=f"{accion.replace('_', ' ')} '{usuario.username}'"
    )
    db.session.commit()

    return jsonify({"mensaje": mensaje, "usuario": _datos_usuario(usuario)})


def cambiar_password(usuario_id):
    data = request.get_json()
    nueva_password = data.get("password", "")

    if not nueva_password or len(nueva_password) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400

    usuario = db.session.get(Usuario, usuario_id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    usuario.password = bcrypt.generate_password_hash(nueva_password).decode("utf-8")

    admin_id = int(get_jwt_identity())
    Auditoria.registrar(
        usuario_id=admin_id,
        accion="cambio_password",
        detalle=f"Cambió la contraseña del usuario '{usuario.username}'"
    )
    db.session.commit()

    return jsonify({"mensaje": "Contraseña actualizada correctamente"})


def cambiar_rol(usuario_id):
    data = request.get_json()
    nuevo_rol = data.get("rol")

    roles_validos = ["estudiante", "docente", "administrador", "direccion"]
    if nuevo_rol not in roles_validos:
        return jsonify({"error": f"Rol inválido. Debe ser uno de: {roles_validos}"}), 400

    usuario = db.session.get(Usuario, usuario_id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    rol_anterior = usuario.rol
    usuario.rol = nuevo_rol

    admin_id = int(get_jwt_identity())
    Auditoria.registrar(
        usuario_id=admin_id,
        accion="cambio_de_rol",
        detalle=f"Usuario '{usuario.username}' cambió de '{rol_anterior}' a '{nuevo_rol}'"
    )
    db.session.commit()

    return jsonify({"mensaje": "Rol actualizado correctamente", "usuario": _datos_usuario(usuario)})


def registrar_docente():
    data = request.get_json()

    campos_requeridos = ["username", "password", "nombres", "apellido_paterno", "apellido_materno", "correo_institucional"]
    faltantes = [campo for campo in campos_requeridos if not data.get(campo)]

    if faltantes:
        return jsonify({"error": f"Faltan campos requeridos: {faltantes}"}), 400

    username = data.get("username")
    if Usuario.query.filter_by(username=username).first():
        return jsonify({"error": "El nombre de usuario ya está en uso"}), 400

    usuario = Usuario(
        username=username,
        password=bcrypt.generate_password_hash(data.get("password")).decode("utf-8"),
        rol="docente",
    )
    db.session.add(usuario)
    db.session.flush()

    docente = Docente(
        usuario_id=usuario.id,
        nombres=data.get("nombres"),
        apellido_paterno=data.get("apellido_paterno"),
        apellido_materno=data.get("apellido_materno"),
        correo_institucional=data.get("correo_institucional"),
    )
    db.session.add(docente)
    db.session.commit()

    admin_id = int(get_jwt_identity())
    Auditoria.registrar(
        usuario_id=admin_id,
        accion="creacion_usuario",
        detalle=f"Registró docente '{username}'"
    )
    db.session.commit()

    return jsonify({
        "mensaje": "Docente registrado correctamente",
        "usuario_id": usuario.id,
        "docente_id": docente.id,
    }), 201


def listar_auditorias():
    query = Auditoria.query

    accion = request.args.get("accion")
    if accion:
        query = query.filter(Auditoria.accion == accion)

    fecha_desde = request.args.get("fecha_desde")
    if fecha_desde:
        query = query.filter(Auditoria.created_at >= fecha_desde)

    fecha_hasta = request.args.get("fecha_hasta")
    if fecha_hasta:
        query = query.filter(Auditoria.created_at <= fecha_hasta + " 23:59:59")

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 30, type=int)
    per_page = min(per_page, 100)

    total = query.count()
    registros = query.order_by(Auditoria.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    acciones_disponibles = db.session.query(Auditoria.accion).distinct().all()
    acciones_disponibles = sorted([a[0] for a in acciones_disponibles])

    items = []
    for a in registros:
        username = a.usuario.username if a.usuario else "—"
        items.append({
            "id": a.id,
            "usuario_id": a.usuario_id,
            "usuario_username": username,
            "accion": a.accion,
            "detalle": a.detalle,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        })

    return jsonify({
        "items": items,
        "total": total,
        "page": page,
        "pages": (total + per_page - 1) // per_page,
        "filtros": {
            "acciones": acciones_disponibles,
        }
    })


def exportar_auditorias():
    registros = Auditoria.query.order_by(Auditoria.created_at.desc()).all()
    
    contenido = "REPORTE DE AUDITORÍA - PORTAL ACADÉMICO MINERVA\n"
    contenido += "="*80 + "\n"
    contenido += f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
    contenido += "="*80 + "\n\n"
    
    for a in registros:
        username = a.usuario.username if a.usuario else "Sistema"
        fecha = a.created_at.strftime('%Y-%m-%d %H:%M:%S')
        contenido += f"[{fecha}] Usuario: {username} | Acción: {a.accion} | Tabla: {a.tabla_afectada}\n"
        if a.detalle:
            contenido += f"Detalles: {a.detalle}\n"
        contenido += "-"*80 + "\n"
        
    from flask import Response
    return Response(
        contenido,
        mimetype="text/plain",
        headers={"Content-disposition": "attachment; filename=reporte_auditoria.txt"}
    )


def reportes_estrategicos():
    total_estudiantes = Estudiante.query.count()
    total_docentes = Docente.query.count()
    total_matriculas = Matricula.query.count()
    matriculas_confirmadas = Matricula.query.filter_by(estado_id=3).count()

    detalles_con_nota = MatriculaDetalle.query.filter(MatriculaDetalle.nota_final.isnot(None)).all()
    promedio_institucional = None
    if detalles_con_nota:
        suma = sum(float(d.nota_final) for d in detalles_con_nota)
        promedio_institucional = round(suma / len(detalles_con_nota), 2)

    certificados_emitidos = Certificado.query.filter_by(emitido=True).count()
    certificados_pendientes = Certificado.query.filter_by(emitido=False).count()

    return jsonify({
        "poblacion": {
            "total_estudiantes": total_estudiantes,
            "total_docentes": total_docentes
        },
        "matricula": {
            "total_solicitudes": total_matriculas,
            "confirmadas": matriculas_confirmadas
        },
        "academico": {
            "promedio_institucional": promedio_institucional
        },
        "certificados": {
            "emitidos": certificados_emitidos,
            "pendientes": certificados_pendientes
        }
    })


def obtener_configuracion_ciclo():
    from app.modelos.configuracion_ciclo_global import ConfiguracionCicloGlobal
    from app.utils.ciclo_academico import ESTADOS_CICLO

    config = db.session.get(ConfiguracionCicloGlobal, 1)
    if not config:
        config = ConfiguracionCicloGlobal(id=1, estado_ciclo=ESTADOS_CICLO[0])
        db.session.add(config)
        db.session.commit()

    return jsonify({
        "id": config.id,
        "periodo_academico_id": config.periodo_academico_id,
        "estado_ciclo": config.estado_ciclo,
        "fecha_cierre_matricula": config.fecha_cierre_matricula.isoformat() if config.fecha_cierre_matricula else None,
        "fecha_limite_notas": config.fecha_limite_notas.isoformat() if config.fecha_limite_notas else None,
        "fecha_cierre_actas": config.fecha_cierre_actas.isoformat() if config.fecha_cierre_actas else None,
        "estados_disponibles": ESTADOS_CICLO,
    })


def actualizar_configuracion_ciclo():
    from datetime import datetime
    from app.modelos.configuracion_ciclo_global import ConfiguracionCicloGlobal

    data = request.get_json()
    config = db.session.get(ConfiguracionCicloGlobal, 1)
    if not config:
        return jsonify({"error": "Configuración no encontrada"}), 404

    if "periodo_academico_id" in data:
        config.periodo_academico_id = data["periodo_academico_id"]
    if "estado_ciclo" in data:
        config.estado_ciclo = data["estado_ciclo"]
    if "fecha_cierre_matricula" in data and data["fecha_cierre_matricula"]:
        config.fecha_cierre_matricula = datetime.fromisoformat(data["fecha_cierre_matricula"])
    if "fecha_limite_notas" in data and data["fecha_limite_notas"]:
        config.fecha_limite_notas = datetime.fromisoformat(data["fecha_limite_notas"])
    if "fecha_cierre_actas" in data and data["fecha_cierre_actas"]:
        config.fecha_cierre_actas = datetime.fromisoformat(data["fecha_cierre_actas"])

    db.session.commit()
    return jsonify({"mensaje": "Configuración de ciclo actualizada correctamente"})