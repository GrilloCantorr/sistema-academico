from app import db
from app.modelos.semestre import Semestre


def ejecutar():
    if Semestre.query.first():
        print("Semestres ya existen")
        return

    semestres = [
        Semestre(codigo="01"),
        Semestre(codigo="02"),
        Semestre(codigo="03"),
        Semestre(codigo="04"),
        Semestre(codigo="05"),
        Semestre(codigo="06"),
        Semestre(codigo="07"),
        Semestre(codigo="08"),
        Semestre(codigo="09"),
        Semestre(codigo="10"),
    ]

    db.session.add_all(semestres)
    db.session.commit()

    print("Semestres creados")