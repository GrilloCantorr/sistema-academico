import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const { estaAutenticado } = useAuth();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  if (!estaAutenticado) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar abierto={sidebarAbierto} setAbierto={setSidebarAbierto} />
      
      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-[280px]">
        {/* Barra superior de control en dispositivos móviles */}
        <header className="lg:hidden bg-[#27040c] text-white px-6 py-4 flex items-center justify-between shadow-md z-30 no-print">
          <h1 className="text-sm font-black uppercase tracking-widest">Portal Académico</h1>
          <button 
            onClick={() => setSidebarAbierto(!sidebarAbierto)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
