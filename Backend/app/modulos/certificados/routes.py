from flask import Blueprint
from app.modulos.certificados import controllers
from app.utils.middlewares import rol_requerido

certificados_bp = Blueprint('certificados', __name__)


@certificados_bp.route('/solicitar', methods=['POST'])
@rol_requerido("estudiante")
def solicitar_certificado():
    return controllers.solicitar_certificado()


@certificados_bp.route('/mis-solicitudes', methods=['GET'])
@rol_requerido("estudiante")
def mis_solicitudes():
    return controllers.mis_solicitudes()


@certificados_bp.route('/bandeja', methods=['GET'])
@rol_requerido("administrador", "direccion")
def listar_solicitudes():
    return controllers.listar_solicitudes()


@certificados_bp.route('/<int:certificado_id>/expediente', methods=['GET'])
@rol_requerido("administrador", "direccion")
def detalle_expediente(certificado_id):
    return controllers.detalle_expediente(certificado_id)


@certificados_bp.route('/<int:certificado_id>/comprobante', methods=['GET'])
@rol_requerido("administrador", "direccion")
def descargar_comprobante(certificado_id):
    return controllers.descargar_comprobante(certificado_id)


@certificados_bp.route('/<int:certificado_id>/notificar', methods=['POST'])
@rol_requerido("administrador", "direccion")
def notificar_solicitud(certificado_id):
    return controllers.notificar_solicitud(certificado_id)


@certificados_bp.route('/tramite/aprobar', methods=['PUT'])
@rol_requerido("administrador")
def aprobar_tramite():
    return controllers.aprobar_tramite()


@certificados_bp.route('/tramite/rechazar', methods=['PUT'])
@rol_requerido("administrador")
def rechazar_tramite():
    return controllers.rechazar_tramite()


@certificados_bp.route('/firmar', methods=['POST'])
@rol_requerido("direccion")
def firmar_certificados():
    return controllers.firmar_certificados()


@certificados_bp.route('/<int:certificado_id>/descargar', methods=['GET'])
def descargar_certificado(certificado_id):
    return controllers.descargar_certificado(certificado_id)


@certificados_bp.route('/verificar/<string:codigo>', methods=['GET'])
def verificar_certificado(codigo):
    return controllers.verificar_certificado(codigo)


@certificados_bp.route('/qr/<string:codigo>', methods=['GET'])
def descargar_qr(codigo):
    return controllers.descargar_qr(codigo)
