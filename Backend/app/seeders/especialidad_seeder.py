from app import db
from app.modelos.especialidad import Especialidad
from app.modelos.facultad import Facultad


def ejecutar():
    if Especialidad.query.first():
        print("Especialidades ya existen")
        return

    sistemas = Facultad.query.filter_by(nombre="Facultad de Ingeniería de Sistemas").first()
    ciberseguridad = Facultad.query.filter_by(nombre="Facultad de Ingeniería en Ciberseguridad").first()
    electronica = Facultad.query.filter_by(nombre="Facultad de Ingeniería Electrónica").first()

    especialidades = [
        Especialidad(nombre="Ingeniería de Software", facultad_id=sistemas.id if sistemas else None),
        Especialidad(nombre="Seguridad de la Información", facultad_id=ciberseguridad.id if ciberseguridad else None),
        Especialidad(nombre="Ingeniería Electrónica", facultad_id=electronica.id if electronica else None),
    ]

    db.session.add_all(especialidades)
    db.session.commit()

    print("Especialidades creadas")