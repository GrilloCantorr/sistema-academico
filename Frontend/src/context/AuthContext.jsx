import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  function iniciarSesion(nuevoUsuario, nuevoToken) {
    setUsuario(nuevoUsuario);
    setToken(nuevoToken);
    localStorage.setItem("usuario", JSON.stringify(nuevoUsuario));
    localStorage.setItem("token", nuevoToken);
  }

  function cerrarSesion() {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  }

  const valor = {
    usuario,
    token,
    iniciarSesion,
    cerrarSesion,
    estaAutenticado: !!token,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}