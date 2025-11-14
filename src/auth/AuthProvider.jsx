import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * AuthProvider simple (visual-only).
 * Guarda el usuario en localStorage/sessionStorage sin token real.
 * Uso:
 *  - Envuelve la app con <AuthProvider>
 *  - Usa useAuth() en componentes para acceder a user, login, logout, isAuthenticated
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    // placeholder: podrías sincronizar con otros mecanismos si lo necesitas
  }, [user]);

  const login = (username, remember = false) => {
    const payload = { username };
    if (remember) {
      localStorage.setItem("auth_user", JSON.stringify(payload));
      sessionStorage.removeItem("auth_user");
    } else {
      sessionStorage.setItem("auth_user", JSON.stringify(payload));
      localStorage.removeItem("auth_user");
    }
    setUser(payload);
  };

  const logout = () => {
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}