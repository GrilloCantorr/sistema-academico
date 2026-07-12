from flask import Blueprint
from app.modulos.notas import controllers
from app.utils.middlewares import rol_requerido

notas_bp = Blueprint('notas', __name__)


@notas_bp.route('/', methods=['GET'])
@rol_requerido("administrador", "direccion")
def listar_notas():
    return controllers.obtener_notas()


@notas_bp.route('/matricula/<int:matricula_id>', methods=['GET'])
@rol_requerido("administrador", "direccion")
def obtener_notas_matricula(matricula_id):
    return controllers.obtener_notas_matricula(matricula_id)


@notas_bp.route('/mi-hoja', methods=['GET'])
@rol_requerido("estudiante")
def mi_hoja_de_notas():
    return controllers.mi_hoja_de_notas()


@notas_bp.route('/', methods=['PUT'])
@rol_requerido("docente")
def registrar_nota():
    return controllers.registrar_nota()


@notas_bp.route('/mis-cursos-notas', methods=['GET'])
@rol_requerido("docente")
def mis_cursos_notas():
    return controllers.mis_cursos_notas()


@notas_bp.route('/estados', methods=['GET'])
def listar_estados_curso():
    return controllers.listar_estados()


@notas_bp.route('/validar-actas', methods=['GET'])
@rol_requerido("administrador", "direccion")
def validar_actas():
    return controllers.validar_actas()


@notas_bp.route('/cerrar-acta', methods=['POST'])
@rol_requerido("administrador")
def cerrar_acta():
    return controllers.cerrar_acta()


@notas_bp.route('/indicadores', methods=['GET'])
@rol_requerido("direccion")
def indicadores_academicos():
    return controllers.indicadores_academicos()
