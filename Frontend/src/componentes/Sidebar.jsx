import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── Íconos SVG inline ────────────────────────────────────────────────────────
const IconHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

const IconClipboard = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="m9 16 2 2 4-4" />
  </svg>
);

const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconNote = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const IconAward = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
  </svg>
);

const IconBarChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconBook = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const IconLogOut = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconHistory = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <polyline points="3 3 3 8 8 8" />
    <line x1="12" y1="7" x2="12" y2="12" />
    <line x1="12" y1="12" x2="16" y2="14" />
  </svg>
);

const IconChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
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
    { label: "Mi Panel", to: "/" },
    { label: "Inscripción de Ciclo", to: "/matricula/solicitar" },
    { label: "Calificaciones", to: "/notas/mi-hoja" },
    { label: "Kardex Académico", to: "/record-academico/mi-historial" },
    { label: "Gestión de Trámites", to: "/certificados/solicitar" },
  ],
  docente: [
    { label: "Consola Docente", to: "/" },
    { label: "Asignaturas a Cargo", to: "/cursos-docentes/mis-cursos" },
    { label: "Evaluaciones", to: "/notas/registrar" },
  ],
  administrador: [
    { label: "Panel de Control", to: "/" },
    { label: "Admisión y Matrícula", to: "/matricula/listar" },
    { label: "Programación Académica", to: "/cursos-docentes/asignar" },
    { label: "Consolidación de Actas", to: "/notas/gestionar" },
    { label: "Trámites por Emitir", to: "/certificados/listar" },
    { label: "Informes de Gestión", to: "/record-academico/reportes" },
    { label: "Seguridad de Usuarios", to: "/administracion/usuarios" },
  ],
  direccion: [
    { label: "Dashboard Directivo", to: "/" },
    { label: "Métricas de Ingreso", to: "/matricula/estadisticas" },
    { label: "Cumplimiento Docente", to: "/cursos-docentes/carga-docente" },
    { label: "Supervisión de Promedios", to: "/notas/gestionar" },
    { label: "Autorización Oficial", to: "/certificados/listar" },
    { label: "Desempeño de Cohortes", to: "/record-academico/reportes" },
    { label: "Logs del Sistema", to: "/administracion/auditorias" },
  ],
};

// ── Estilos ───────────────────────────────────────────────────────────────────
const S = {
  aside: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "var(--sidebar-width, 280px)", // Agrandamos la barra de 260px a 280px
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
    fontSize: "14px",
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
    padding: "20px 14px", // Más padding interno
    display: "flex",
    flexDirection: "column",
    gap: "6px", // Más separación entre elementos (de 2px a 6px)
  },
  linkActive: {
    display: "flex",
    alignItems: "center",
    gap: "14px", // Más gap interno (de 12px a 14px)
    padding: "13px 16px", // Más padding interno (de 11px 14px a 13px 16px)
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    color: "#0F172A",
    fontSize: "15px", // Tamaño de fuente más grande (de 14px a 15px)
    fontWeight: "600",
    textDecoration: "none",
    transition: "all 0.18s ease",
    letterSpacing: "-0.01em",
  },
  linkInactive: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "13px 16px",
    borderRadius: "10px",
    backgroundColor: "transparent",
    color: "rgba(255,255,255,0.72)",
    fontSize: "15px", // Tamaño de fuente más grande
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
    gap: "14px",
    padding: "13px 16px",
    borderRadius: "10px",
    backgroundColor: "transparent",
    color: "rgba(255,255,255,0.55)",
    fontSize: "15px", // Tamaño de fuente más grande
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
