from app import db
from app.modelos.especialidad import Especialidad
from app.modelos.estudiante import Estudiante
from app.modelos.usuario import Usuario


ESTUDIANTES_DATA = [
    {
        "username": "estudiante1_prueba",
        "nombres": "Maria Fernanda",
        "apellido_paterno": "Gomez",
        "apellido_materno": "Vargas",
        "dni": "12345678",
        "correo": "maria.gomez@universidad.edu.pe",
    },
    {
        "username": "estudiante2_prueba",
        "nombres": "Jose Luis",
        "apellido_paterno": "Hernandez",
        "apellido_materno": "Paredes",
        "dni": "23456789",
        "correo": "jose.hernandez@universidad.edu.pe",
    },
    {
        "username": "estudiante3_prueba",
        "nombres": "Carmen Rosa",
        "apellido_paterno": "Silva",
        "apellido_materno": "Martinez",
        "dni": "34567890",
        "correo": "carmen.silva@universidad.edu.pe",
    },
    {
        "username": "estudiante4_prueba",
        "nombres": "Pedro Antonio",
        "apellido_paterno": "Lopez",
        "apellido_materno": "Castillo",
        "dni": "45678901",
        "correo": "pedro.lopez@universidad.edu.pe",
    },
    {
        "username": "estudiante5_prueba",
        "nombres": "Sofia Beatriz",
        "apellido_paterno": "Ramirez",
        "apellido_materno": "Ortiz",
        "dni": "56789012",
        "correo": "sofia.ramirez@universidad.edu.pe",
    },
]


def ejecutar():
    especialidad = Especialidad.query.first()
    if not especialidad:
        print("No existe una especialidad para crear estudiantes")
        return

    for data in ESTUDIANTES_DATA:
        existe = Estudiante.query.join(Usuario).filter(
            Usuario.username == data["username"]
        ).first()
        if existe:
            continue

        usuario = Usuario.query.filter_by(username=data["username"]).first()
        if not usuario:
            print(f"No existe el usuario {data['username']}")
            continue

        estudiante = Estudiante(
            usuario_id=usuario.id,
            especialidad_id=especialidad.id,
            nombres=data["nombres"],
            apellido_paterno=data["apellido_paterno"],
            apellido_materno=data["apellido_materno"],
            dni=data["dni"],
            correo_institucional=data["correo"],
            tiene_deuda_activa=False,
            tiene_sancion_activa=False,
        )
        db.session.add(estudiante)

    db.session.commit()
    print(f"Estudiantes creados: {Estudiante.query.count()}")
