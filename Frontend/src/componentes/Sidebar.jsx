import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── Íconos SVG inline ────────────────────────────────────────────────────────
const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconClipboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="4" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
  </svg>
);

const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconNote = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const IconAward = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

const IconBarChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconBook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const IconLogOut = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconHistory = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="12 8 12 12 14 14"/>
    <path d="M3.05 11a9 9 0 1 0 .5-4.5"/>
    <polyline points="3 3 3 9 9 9"/>
  </svg>
);

const IconChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
    <path d="M22 12A10 10 0 0 0 12 2v10z"/>
  </svg>
);

// ── Mapeo ícono por ruta ─────────────────────────────────────────────────────
function getIcon(to) {
  if (to === "/") return <IconHome />;
  if (to.includes("solicitar") && to.includes("matricula")) return <IconClipboard />;
  if (to.includes("listar") && to.includes("matricula")) return <IconClipboard />;
  if (to.includes("estadisticas")) return <IconBarChart />;
  if (to.includes("asignar")) return <IconUsers />;
  if (to.includes("carga-docente")) return <IconUsers />;
  if (to.includes("mis-cursos")) return <IconBook />;
  if (to.includes("notas")) return <IconNote />;
  if (to.includes("certificado")) return <IconAward />;
  if (to.includes("historial")) return <IconHistory />;
  if (to.includes("reportes")) return <IconBarChart />;
  if (to.includes("usuarios")) return <IconShield />;
  if (to.includes("auditoria")) return <IconShield />;
  return <IconBook />;
}

// ── Menú por rol ─────────────────────────────────────────────────────────────
const MENU_POR_ROL = {
  estudiante: [
    { label: "Inicio", to: "/" },
    { label: "Solicitar matrícula", to: "/matricula/solicitar" },
    { label: "Mis notas", to: "/notas/mi-hoja" },
    { label: "Mi historial", to: "/record-academico/mi-historial" },
    { label: "Solicitar certificado", to: "/certificados/solicitar" },
  ],
  docente: [
    { label: "Inicio", to: "/" },
    { label: "Mis cursos", to: "/cursos-docentes/mis-cursos" },
    { label: "Registrar notas", to: "/notas/registrar" },
  ],
  administrador: [
    { label: "Inicio", to: "/" },
    { label: "Listar matrículas", to: "/matricula/listar" },
    { label: "Asignar docentes", to: "/cursos-docentes/asignar" },
    { label: "Gestionar notas", to: "/notas/gestionar" },
    { label: "Listar certificados", to: "/certificados/listar" },
    { label: "Reportes", to: "/record-academico/reportes" },
    { label: "Usuarios y roles", to: "/administracion/usuarios" },
  ],
  direccion: [
    { label: "Inicio", to: "/" },
    { label: "Estadísticas", to: "/matricula/estadisticas" },
    { label: "Carga docente", to: "/cursos-docentes/carga-docente" },
    { label: "Gestionar notas", to: "/notas/gestionar" },
    { label: "Certificados", to: "/certificados/listar" },
    { label: "Reportes", to: "/record-academico/reportes" },
    { label: "Auditorías", to: "/administracion/auditorias" },
  ],
};

// ── Estilos ───────────────────────────────────────────────────────────────────
const S = {
  aside: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "var(--sidebar-width, 260px)",
    backgroundColor: "#0F172A",
    display: "flex",
    flexDirection: "column",
    zIndex: 50,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  header: {
    padding: "28px 24px 22px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  title: {
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "0.12em",
    color: "#ffffff",
    textTransform: "uppercase",
    margin: 0,
    lineHeight: 1.2,
  },
  nav: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  linkActive: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 14px",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    color: "#0F172A",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    transition: "all 0.18s ease",
    letterSpacing: "-0.01em",
  },
  linkInactive: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 14px",
    borderRadius: "10px",
    backgroundColor: "transparent",
    color: "rgba(255,255,255,0.72)",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
    transition: "all 0.18s ease",
    letterSpacing: "-0.01em",
  },
  footer: {
    padding: "16px 12px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  logoutBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "12px",
    padding: "11px 14px",
    borderRadius: "10px",
    backgroundColor: "transparent",
    color: "rgba(255,255,255,0.55)",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    transition: "all 0.18s ease",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    letterSpacing: "-0.01em",
    boxShadow: "none",
  },
};

// ── Componente ────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  if (!usuario) return null;

  const enlaces = MENU_POR_ROL[usuario.rol] || [];

  function manejarCerrarSesion() {
    cerrarSesion();
    navigate("/login");
  }

  return (
    <aside style={S.aside}>
      {/* Título */}
      <div style={S.header}>
        <h1 style={S.title}>Portal&nbsp;Academico</h1>
      </div>

      {/* Navegación */}
      <nav style={S.nav}>
        {enlaces.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            style={({ isActive }) => (isActive ? S.linkActive : S.linkInactive)}
            onMouseEnter={(e) => {
              const active = e.currentTarget.style.backgroundColor === "rgb(255, 255, 255)";
              if (!active) {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "#ffffff";
              }
            }}
            onMouseLeave={(e) => {
              const active = e.currentTarget.style.backgroundColor === "rgb(255, 255, 255)";
              if (!active) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.72)";
              }
            }}
          >
            <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
              {getIcon(item.to)}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Cerrar sesión */}
      <div style={S.footer}>
        <button
          onClick={manejarCerrarSesion}
          style={S.logoutBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.15)";
            e.currentTarget.style.color = "rgba(252,165,165,0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.55)";
          }}
        >
          <IconLogOut />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
