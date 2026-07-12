from app import db
from app.modelos.tipo_docente import TipoDocente


def ejecutar():
    if TipoDocente.query.first():
        print("Tipos de docente ya existen")
        return

    tipos = [
        TipoDocente(nombre="Nombrado"),
        TipoDocente(nombre="Contratado"),
        TipoDocente(nombre="Invitado"),
    ]

    db.session.add_all(tipos)
    db.session.commit()

    print("Tipos de docente creados")