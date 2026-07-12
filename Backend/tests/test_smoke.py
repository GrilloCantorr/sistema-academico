BLUEPRINTS = [
    "auth",
    "matricula",
    "notas",
    "cursos_docentes",
    "administracion",
    "certificados",
    "record_academico",
    "dashboard",
]

# Known protected GET routes that require a valid JWT
PROTECTED_ROUTES = [
    ("GET", "/api/administracion/usuarios"),
    ("GET", "/api/notas/"),
    ("GET", "/api/matriculas/"),
    ("GET", "/api/certificados/bandeja"),
    ("GET", "/api/record-academico/reportes"),
]


def test_app_starts(app):
    assert app is not None
    assert app.testing is True


def test_all_blueprints_registered(app):
    registered = {bp.name for bp in app.blueprints.values()}
    for name in BLUEPRINTS:
        assert name in registered, f"Blueprint '{name}' no registrado"


def test_login_invalid_returns_401(client):
    resp = client.post(
        "/api/auth/login",
        json={"username": "no_existe", "password": "x"},
    )
    assert resp.status_code == 401
    assert "error" in resp.get_json()


def test_login_no_json_returns_400(client):
    resp = client.post("/api/auth/login", data="not-json", content_type="text/plain")
    assert resp.status_code in (400, 415)


def test_protected_endpoints_return_401(client):
    for method, route in PROTECTED_ROUTES:
        resp = client.open(route, method=method)
        assert resp.status_code == 401, (
            f"{method} {route} devolvio {resp.status_code}, esperado 401"
        )


def test_public_endpoint_login_with_valid_credentials(client):
    resp = client.post(
        "/api/auth/login",
        json={"username": "admin_prueba", "password": "test1234"},
    )
    data = resp.get_json()
    assert resp.status_code == 200, data
    assert "token" in data
    assert data["usuario"]["username"] == "admin_prueba"
    assert data["usuario"]["rol"] == "administrador"


def test_authenticated_access_succeeds(client, auth_header):
    resp = client.get(
        "/api/administracion/usuarios",
        headers=auth_header,
    )
    assert resp.status_code == 200


def test_cors_headers_present(client):
    resp = client.options("/api/auth/login")
    assert "Access-Control-Allow-Origin" in resp.headers
