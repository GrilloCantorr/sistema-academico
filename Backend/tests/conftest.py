from datetime import datetime, timezone
import pytest
from app import crear_app, db as _db
from app.modelos.usuario import Usuario
from flask_bcrypt import Bcrypt


TEST_PASSWORD = "test1234"


@pytest.fixture(scope="session")
def app():
    application = crear_app()
    application.config.update(
        SQLALCHEMY_DATABASE_URI="sqlite:///:memory:",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        TESTING=True,
        JWT_SECRET_KEY="test-secret-key",
    )
    with application.app_context():
        _db.create_all()
        _seed_usuario(application)
        yield application
        _db.drop_all()


def _seed_usuario(application):
    bcrypt = Bcrypt(application)
    admin = Usuario(
        username="admin_prueba",
        password=bcrypt.generate_password_hash(TEST_PASSWORD).decode("utf-8"),
        rol="administrador",
        created_at=datetime.now(timezone.utc),
        modified_at=datetime.now(timezone.utc),
    )
    _db.session.add(admin)
    _db.session.commit()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def token_admin(client):
    resp = client.post(
        "/api/auth/login",
        json={"username": "admin_prueba", "password": TEST_PASSWORD},
    )
    assert resp.status_code == 200
    return resp.get_json()["token"]


@pytest.fixture
def auth_header(token_admin):
    return {"Authorization": f"Bearer {token_admin}"}
