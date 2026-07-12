from app import db
from app.modelos.facultad import Facultad


def ejecutar():
    if Facultad.query.first():
        print("Facultades ya existen")
        return

    facultades = [
        Facultad(nombre="Facultad de Ingeniería de Sistemas"),
        Facultad(nombre="Facultad de Ingeniería en Ciberseguridad"),
        Facultad(nombre="Facultad de Ingeniería Electrónica"),
    ]

    db.session.add_all(facultades)
    db.session.commit()

    print("Facultades creadas")