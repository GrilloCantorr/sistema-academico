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
    background: "radial-gradient(circle at top left, #3b0712, #0f172a 70%, #1e1b4b 100%)",
    padding: "24px 16px",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    position: "relative",
    overflow: "hidden"
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(16px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    padding: "48px 40px 40px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    zIndex: 10
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0f172a] font-sans no-print relative overflow-hidden">
      {/* Columna Izquierda: Decorativa e Identidad Visual del Sistema */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-gradient-to-br from-[#3b0712] via-[#0f172a] to-[#1e1b4b] relative p-16 flex-col justify-between overflow-hidden">
        {/* Decoraciones abstractas fluidas de fondo */}
        <div className="absolute -top-24 -left-24 w-[30vw] h-[30vw] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
        
        {/* Isotipo del Sistema */}
        <div className="z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <span className="text-white font-extrabold text-sm tracking-widest uppercase">Portal Académico</span>
        </div>

        {/* Mensaje de Bienvenida Principal */}
        <div className="z-10 my-auto max-w-xl">
          <h1 className="text-6xl lg:text-7xl font-black text-white leading-none tracking-tight mb-8">
            Sistema <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-rose-500 to-indigo-400">Académico</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-300 font-medium leading-relaxed max-w-lg">
            Plataforma institucional de control curricular, evaluación docente y servicios digitales para toda la comunidad académica.
          </p>
        </div>

        {/* Footer del panel decorativo */}
        <div className="z-10 text-xs text-gray-500 font-bold uppercase tracking-wider">
          © 2026 Facultad de Ingeniería de Sistemas · UNCP
        </div>
      </div>

      {/* Columna Derecha: Barra Lateral del Formulario de Login */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center bg-white p-8 sm:p-16 md:p-12 lg:p-16 relative">
        {/* Logotipo para Móviles (Visible solo en pantallas pequeñas) */}
        <div className="md:hidden flex items-center gap-2 mb-12 justify-center">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <span className="text-[#0f172a] font-extrabold text-xs tracking-widest uppercase">Portal Académico</span>
        </div>

        <div className="max-w-md w-full mx-auto">
          {/* Título de Sección */}
          <div className="mb-10">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-3">Iniciar sesión</h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">Bienvenido de vuelta. Por favor, introduzca sus credenciales oficiales para continuar.</p>
          </div>

          {/* Formulario */}
          <form onSubmit={manejarEnvio} noValidate>
            {/* Campo Usuario */}
            <div className="mb-5">
              <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest" htmlFor="login-username">Usuario</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-400 pointer-events-none"><IconUser /></span>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese su usuario"
                  required
                  autoComplete="username"
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm outline-none transition bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="mb-8">
              <label className="block mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest" htmlFor="login-password">Contraseña</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-400 pointer-events-none"><IconLock /></span>
                <input
                  id="login-password"
                  type={verPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  required
                  autoComplete="current-password"
                  className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl text-sm outline-none transition bg-gray-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <button
                  type="button"
                  className="absolute right-4 text-gray-400 hover:text-gray-600 transition"
                  onClick={() => setVerPass(!verPass)}
                  tabIndex={-1}
                  aria-label={verPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {verPass ? <IconEye /> : <IconEyeOff />}
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full py-4 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-hover disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Ingresando...</span>
                </>
              ) : "Ingresar"}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl flex items-center gap-2.5">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
