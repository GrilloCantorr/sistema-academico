from datetime import datetime
from app import db
from app.modelos.periodo_academico import PeriodoAcademico


class PeriodoAcademicoService:

    @staticmethod
    def crear_periodo(data):
        nombre = data.get("nombre")
        if not nombre:
            return None, "El nombre del periodo es requerido"

        periodo = PeriodoAcademico(
            nombre=nombre,
            fecha_inicio=datetime.fromisoformat(data["fecha_inicio"]) if data.get("fecha_inicio") else None,
            fecha_fin=datetime.fromisoformat(data["fecha_fin"]) if data.get("fecha_fin") else None,
            dias_limite_pago=data.get("dias_limite_pago", 15),
        )
        db.session.add(periodo)
        db.session.commit()
        return {"mensaje": "Periodo académico creado", "periodo_id": periodo.id}, None

    @staticmethod
    def actualizar_periodo(id, data):
        periodo = db.session.get(PeriodoAcademico, id)
        if not periodo:
            return None, "Periodo académico no encontrado"

        if "nombre" in data:
            periodo.nombre = data["nombre"]
        if "fecha_inicio" in data:
            periodo.fecha_inicio = datetime.fromisoformat(data["fecha_inicio"])
        if "fecha_fin" in data:
            periodo.fecha_fin = datetime.fromisoformat(data["fecha_fin"])
        if "dias_limite_pago" in data:
            periodo.dias_limite_pago = data["dias_limite_pago"]

        db.session.commit()
        return {"mensaje": "Periodo académico actualizado"}, None
