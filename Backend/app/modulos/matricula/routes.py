from flask import Blueprint
from app.modulos.matricula import controllers
from app.utils.middlewares import rol_requerido

matricula_bp = Blueprint('matricula', __name__)


@matricula_bp.route('/', methods=['GET'])
@rol_requerido("administrador", "direccion")
def listar_matriculas():
    return controllers.listar_matriculas()


@matricula_bp.route('/', methods=['POST'])
@rol_requerido("estudiante")
def crear_matricula():
    return controllers.crear_matricula()


@matricula_bp.route('/periodos', methods=['GET'])
def listar_periodos():
    return controllers.listar_periodos()


@matricula_bp.route('/periodo-actual', methods=['GET'])
def periodo_actual():
    return controllers.periodo_actual()


@matricula_bp.route('/secciones', methods=['GET'])
def listar_secciones():
    return controllers.listar_secciones()


@matricula_bp.route('/estados', methods=['GET'])
def listar_estados_matricula():
    return controllers.listar_estados_matricula()


@matricula_bp.route('/<int:matricula_id>/validar', methods=['PUT'])
@rol_requerido("administrador")
def validar_requisitos(matricula_id):
    return controllers.validar_requisitos(matricula_id)


@matricula_bp.route('/<int:matricula_id>/pago', methods=['POST'])
@rol_requerido("administrador")
def registrar_pago(matricula_id):
    return controllers.registrar_pago(matricula_id)


@matricula_bp.route('/<int:matricula_id>/ficha-oficial', methods=['POST'])
@rol_requerido("administrador")
def generar_ficha_oficial(matricula_id):
    return controllers.generar_ficha_oficial(matricula_id)


@matricula_bp.route('/estadisticas', methods=['GET'])
@rol_requerido("direccion")
def estadisticas():
    return controllers.estadisticas()


@matricula_bp.route('/<int:matricula_id>/ficha', methods=['GET'])
@rol_requerido("estudiante")
def descargar_ficha(matricula_id):
    return controllers.descargar_ficha(matricula_id)


@matricula_bp.route('/cursos-disponibles', methods=['GET'])
@rol_requerido("estudiante")
def cursos_disponibles():
    return controllers.cursos_disponibles()