import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

/**
 * RequireAuth - Protege rutas en el cliente.
 * Ejemplo:
 *  <Route path="/gestiones" element={<RequireAuth><GestionesSearch /></RequireAuth>} />
 */
export default function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}