from app import db
from app.modelos.permiso_rol import PermisoRol


def ejecutar():
    if PermisoRol.query.first():
        print("Permisos de rol ya existen")
        return

    roles = ["estudiante", "docente", "administrador", "direccion"]
    recursos = ["matriculas", "notas", "certificados", "usuarios", "configuracion"]

    permisos = []
    for rol in roles:
        for recurso in recursos:
            permisos.append(PermisoRol(
                rol=rol,
                recurso=recurso,
                puede_crear=rol in ("administrador", "direccion"),
                puede_leer=True,
                puede_actualizar=rol in ("administrador", "direccion"),
                puede_eliminar=rol == "administrador",
                puede_ejecutar_batch=rol == "administrador",
            ))

    db.session.add_all(permisos)
    db.session.commit()
    print("Permisos de rol creados")
