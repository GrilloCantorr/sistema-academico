from app import db
from app.modelos.estado_matricula import EstadoMatricula
from app.modelos.estudiante import Estudiante
from app.modelos.matricula import Matricula
from app.modelos.periodo_academico import PeriodoAcademico
from app.modelos.semestre import Semestre


def ejecutar():
    if Matricula.query.first():
        print("Matriculas ya existen")
        return

    estudiante = Estudiante.query.first()
    periodo = PeriodoAcademico.query.first()
    semestre = Semestre.query.first()
    estado = EstadoMatricula.query.filter_by(nombre="Matriculado").first()

    if not estudiante or not periodo or not semestre or not estado:
        print("No hay datos suficientes para crear matriculas")
        return

    matricula = Matricula(
        estudiante_id=estudiante.id,
        periodo_academico_id=periodo.id,
        semestre_id=semestre.id,
        estado_id=estado.id,
    )

    db.session.add(matricula)
    db.session.commit()

    print("Matriculas creadas")