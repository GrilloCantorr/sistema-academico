from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def rol_requerido(*roles_permitidos):
    def decorador(funcion):
        @wraps(funcion)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            rol_usuario = claims.get("rol")

            if rol_usuario not in roles_permitidos:
                return jsonify({"error": "No tienes permiso para esta acción"}), 403

            return funcion(*args, **kwargs)
        return wrapper
    return decorador