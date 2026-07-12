import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const { estaAutenticado } = useAuth();

  if (!estaAutenticado) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-[var(--sidebar-width)] min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
