from app import db
from app.modelos.docente import Docente
from app.modelos.usuario import Usuario


DOCENTES_DATA = [
    {
        "username": "docente1_prueba",
        "nombres": "Juan Carlos",
        "apellido_paterno": "Perez",
        "apellido_materno": "Lopez",
        "dni": "87654321",
        "correo": "juan.perez@universidad.edu.pe",
    },
    {
        "username": "docente2_prueba",
        "nombres": "Ana Maria",
        "apellido_paterno": "Garcia",
        "apellido_materno": "Torres",
        "dni": "76543210",
        "correo": "ana.garcia@universidad.edu.pe",
    },
    {
        "username": "docente3_prueba",
        "nombres": "Carlos Alberto",
        "apellido_paterno": "Ruiz",
        "apellido_materno": "Mendoza",
        "dni": "65432109",
        "correo": "carlos.ruiz@universidad.edu.pe",
    },
    {
        "username": "docente4_prueba",
        "nombres": "Lucia Patricia",
        "apellido_paterno": "Fernandez",
        "apellido_materno": "Diaz",
        "dni": "54321098",
        "correo": "lucia.fernandez@universidad.edu.pe",
    },
    {
        "username": "docente5_prueba",
        "nombres": "Miguel Angel",
        "apellido_paterno": "Torres",
        "apellido_materno": "Rios",
        "dni": "43210987",
        "correo": "miguel.torres@universidad.edu.pe",
    },
]


def ejecutar():
    for data in DOCENTES_DATA:
        existe = Docente.query.join(Usuario).filter(
            Usuario.username == data["username"]
        ).first()
        if existe:
            continue

        usuario = Usuario.query.filter_by(username=data["username"]).first()
        if not usuario:
            print(f"No existe el usuario {data['username']}")
            continue

        docente = Docente(
            usuario_id=usuario.id,
            nombres=data["nombres"],
            apellido_paterno=data["apellido_paterno"],
            apellido_materno=data["apellido_materno"],
            dni=data["dni"],
            correo_institucional=data["correo"],
        )
        db.session.add(docente)

    db.session.commit()
    print(f"Docentes creados: {Docente.query.count()}")
