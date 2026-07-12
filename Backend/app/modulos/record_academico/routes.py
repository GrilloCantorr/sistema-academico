from flask import Blueprint, jsonify
from app.modulos.record_academico import controllers
from app.utils.middlewares import rol_requerido

record_academico_bp = Blueprint('record_academico', __name__)


@record_academico_bp.route('/', methods=['GET'])
def index_record_academico():
    return jsonify({
        "endpoints": [
            "/<estudiante_id>",
            "/mi-historial",
            "/progreso/<estudiante_id>",
            "/tipos-clasificacion",
            "/estados-permanencia",
            "/reportes",
            "/desempeno-cohorte"
        ]
    })


@record_academico_bp.route('/<int:estudiante_id>', methods=['GET'])
@rol_requerido("administrador", "direccion")
def obtener_record(estudiante_id):
    return controllers.obtener_record(estudiante_id)


@record_academico_bp.route('/mi-historial', methods=['GET'])
@rol_requerido("estudiante")
def mi_historial():
    return controllers.mi_historial()


@record_academico_bp.route('/progreso/<int:estudiante_id>', methods=['GET'])
@rol_requerido("administrador", "direccion")
def obtener_progreso(estudiante_id):
    return controllers.obtener_progreso(estudiante_id)


@record_academico_bp.route('/tipos-clasificacion', methods=['GET'])
def listar_tipos_clasificacion():
    return controllers.listar_tipos_clasificacion()


@record_academico_bp.route('/estados-permanencia', methods=['GET'])
def listar_estados_permanencia():
    return controllers.listar_estados_permanencia()


@record_academico_bp.route('/reportes', methods=['GET'])
@rol_requerido("administrador", "direccion")
def reportes_consolidados():
    return controllers.reportes_consolidados()


@record_academico_bp.route('/desempeno-cohorte', methods=['GET'])
@rol_requerido("administrador", "direccion")
def desempeno_por_cohorte():
    return controllers.desempeno_por_cohorte()


@record_academico_bp.route('/buscar-estudiantes', methods=['GET'])
@rol_requerido("administrador", "direccion")
def buscar_estudiantes():
    return controllers.buscar_estudiantes()


@record_academico_bp.route('/kardex/<int:estudiante_id>', methods=['GET'])
@rol_requerido("administrador", "direccion")
def kardex_estudiante(estudiante_id):
    return controllers.kardex_estudiante(estudiante_id)


@record_academico_bp.route('/kardex/<int:estudiante_id>/pdf', methods=['GET'])
@rol_requerido("administrador", "direccion")
def descargar_kardex_pdf(estudiante_id):
    return controllers.descargar_kardex_pdf(estudiante_id)