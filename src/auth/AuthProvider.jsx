import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * AuthProvider simple (visual-only).
 * Almacena user = { username, role, displayName } en local/session storage.
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
    // Si quieres sincronizar con otros mecanismos, aquí.
  }, [user]);

  // login recibe un objeto userObj (ej. {username, role, displayName})
  const login = (userObj, remember = false) => {
    if (!userObj) return;
    if (remember) {
      localStorage.setItem("auth_user", JSON.stringify(userObj));
      sessionStorage.removeItem("auth_user");
    } else {
      sessionStorage.setItem("auth_user", JSON.stringify(userObj));
      localStorage.removeItem("auth_user");
    }
    setUser(userObj);
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