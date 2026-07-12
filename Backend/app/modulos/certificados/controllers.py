from flask import jsonify, request, send_file
from flask_jwt_extended import get_jwt_identity
from app.modulos.certificados.services import CertificadoService


def solicitar_certificado():
    usuario_id = int(get_jwt_identity())
    tipo = request.form.get("tipo")
    archivo = request.files.get("comprobante")

    resultado, error, codigo = CertificadoService.solicitar_documento(usuario_id, tipo, archivo)

    if error:
        return jsonify({"error": error}), codigo

    return jsonify(resultado), codigo


def mis_solicitudes():
    usuario_id = int(get_jwt_identity())
    resultado, error = CertificadoService.mis_solicitudes(usuario_id)

    if error:
        return jsonify({"error": error}), 404

    return jsonify(resultado)


def listar_solicitudes():
    estado = request.args.get("estado")
    pagina = request.args.get("pagina", default=1, type=int)
    por_pagina = request.args.get("por_pagina", default=10, type=int)

    resultado, error = CertificadoService.bandeja_solicitudes(estado, pagina, por_pagina)

    if error:
        return jsonify({"error": error}), 404

    return jsonify(resultado)


def detalle_expediente(certificado_id):
    resultado, error = CertificadoService.detalle_expediente(certificado_id)

    if error:
        return jsonify({"error": error}), 404

    return jsonify(resultado)


def descargar_comprobante(certificado_id):
    ruta, error = CertificadoService.obtener_comprobante(certificado_id)

    if error:
        return jsonify({"error": error}), 404

    return send_file(ruta)


def notificar_solicitud(certificado_id):
    resultado, error, codigo = CertificadoService.notificar_estudiante(certificado_id)

    if error:
        return jsonify({"error": error}), codigo

    return jsonify(resultado), codigo


def aprobar_tramite():
    certificado_id = request.get_json().get("id")

    resultado, error, codigo = CertificadoService.aprobar_tramite(certificado_id)

    if error:
        return jsonify({"error": error}), codigo

    return jsonify(resultado), codigo


def rechazar_tramite():
    datos = request.get_json()
    certificado_id = datos.get("id")
    motivo = datos.get("motivo")

    resultado, error, codigo = CertificadoService.rechazar_tramite(certificado_id, motivo)

    if error:
        return jsonify({"error": error}), codigo

    return jsonify(resultado), codigo


def firmar_certificados():
    certificado_ids = request.get_json().get("certificado_ids", [])

    resultado, error = CertificadoService.firmar_certificados(certificado_ids)

    if error:
        return jsonify({"error": error}), 400

    return jsonify(resultado)


def descargar_certificado(certificado_id):
    ruta, error = CertificadoService.obtener_ruta_certificado_emitido(certificado_id)

    if error:
        return jsonify({"error": error}), 404

    return send_file(ruta, as_attachment=True, download_name=f"certificado_{certificado_id}.pdf")


def verificar_certificado(codigo):
    resultado, error = CertificadoService.verificar_publico(codigo)

    if error:
        return jsonify({"error": error}), 404

    return jsonify(resultado)


def descargar_qr(codigo):
    buffer, error = CertificadoService.generar_qr(codigo)

    if error:
        return jsonify({"error": error}), 404

    return send_file(
        buffer,
        mimetype="image/png",
        as_attachment=False
    )
