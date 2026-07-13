import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { iniciarSesion as loginServicio } from "../servicios/auth.servicio";
import { useAuth } from "../context/AuthContext";

// ── Íconos SVG ────────────────────────────────────────────────────────────────
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ── Estilos ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    padding: "24px 16px",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #e5e7eb",
    padding: "44px 40px 40px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    textAlign: "center",
    marginBottom: "36px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#111827",
    letterSpacing: "-0.03em",
    margin: "0 0 6px 0",
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: "14px",
    fontWeight: "400",
    color: "#6b7280",
    margin: 0,
    letterSpacing: "-0.01em",
  },
  fieldGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.09em",
    marginBottom: "8px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  iconLeft: {
    position: "absolute",
    left: "14px",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  iconRight: {
    position: "absolute",
    right: "14px",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: 0,
    lineHeight: 0,
    transition: "color 0.15s ease",
  },
  input: {
    width: "100%",
    padding: "13px 14px 13px 44px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "400",
    color: "#111827",
    backgroundColor: "#ffffff",
    outline: "none",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease",
    letterSpacing: "-0.005em",
  },
  inputPassword: {
    width: "100%",
    padding: "13px 44px 13px 44px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "400",
    color: "#111827",
    backgroundColor: "#ffffff",
    outline: "none",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease",
    letterSpacing: "-0.005em",
  },
  btnSubmit: {
    width: "100%",
    padding: "14px",
    marginTop: "8px",
    backgroundColor: "#be123c",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    letterSpacing: "-0.01em",
    transition: "background-color 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease",
    boxShadow: "0 4px 14px rgba(190,18,60,0.25)",
  },
  btnSubmitDisabled: {
    backgroundColor: "#d1d5db",
    color: "#9ca3af",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  errorBox: {
    marginTop: "18px",
    padding: "12px 16px",
    backgroundColor: "#fef2f2",
    border: "1.5px solid #fecaca",
    borderRadius: "10px",
    color: "#dc2626",
    fontSize: "13.5px",
    fontWeight: "500",
    letterSpacing: "-0.005em",
  },
};

// ── Componente ────────────────────────────────────────────────────────────────
export default function Login() {
  const [username, setUsername]       = useState("");
  const [password, setPassword]       = useState("");
  const [verPass, setVerPass]         = useState(false);
  const [error, setError]             = useState(null);
  const [cargando, setCargando]       = useState(false);
  const [focusUser, setFocusUser]     = useState(false);
  const [focusPass, setFocusPass]     = useState(false);
  const { iniciarSesion, estaAutenticado } = useAuth();
  const navigate = useNavigate();

  if (estaAutenticado) return <Navigate to="/" replace />;

  async function manejarEnvio(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const { data, error } = await loginServicio(username, password);
    setCargando(false);
    if (error) { setError(error); return; }
    iniciarSesion(data.usuario, data.token);
    navigate("/");
  }

  const inputFocusStyle = {
    borderColor: "#be123c",
    boxShadow: "0 0 0 3px rgba(190,18,60,0.12)",
  };

  return (
    <div style={{
      ...S.page,
      background: "radial-gradient(circle, #4c0519 0%, #1c1917 100%)",
    }}>
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <div style={S.card}>

        {/* Encabezado */}
        <div style={S.cardHeader}>
          <h1 style={S.title}>Iniciar sesión</h1>
          <p style={S.subtitle}>Portal Académico</p>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarEnvio} noValidate>

          {/* Campo Usuario */}
          <div style={S.fieldGroup}>
            <label style={S.label} htmlFor="login-username">Usuario</label>
            <div style={S.inputWrapper}>
              <span style={S.iconLeft}><IconUser /></span>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su usuario"
                required
                autoComplete="username"
                style={{
                  ...S.input,
                  ...(focusUser ? inputFocusStyle : {}),
                }}
                onFocus={() => setFocusUser(true)}
                onBlur={() => setFocusUser(false)}
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div style={{ ...S.fieldGroup, marginBottom: "28px" }}>
            <label style={S.label} htmlFor="login-password">Contraseña</label>
            <div style={S.inputWrapper}>
              <span style={S.iconLeft}><IconLock /></span>
              <input
                id="login-password"
                type={verPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
                autoComplete="current-password"
                style={{
                  ...S.inputPassword,
                  ...(focusPass ? inputFocusStyle : {}),
                }}
                onFocus={() => setFocusPass(true)}
                onBlur={() => setFocusPass(false)}
              />
              <button
                type="button"
                style={S.iconRight}
                onClick={() => setVerPass(!verPass)}
                tabIndex={-1}
                aria-label={verPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#6b7280")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
              >
                {verPass ? <IconEye /> : <IconEyeOff />}
              </button>
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={cargando}
            style={{
              ...S.btnSubmit,
              ...(cargando ? S.btnSubmitDisabled : {}),
            }}
            onMouseEnter={(e) => {
              if (!cargando) {
                e.currentTarget.style.backgroundColor = "#9f1239";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(190,18,60,0.35)";
              }
            }}
            onMouseLeave={(e) => {
              if (!cargando) {
                e.currentTarget.style.backgroundColor = "#be123c";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(190,18,60,0.25)";
              }
            }}
          >
            {cargando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        {/* Error */}
        {error && <div style={S.errorBox}>⚠ {error}</div>}
      </div>
      </div>
    </div>
  );
}
