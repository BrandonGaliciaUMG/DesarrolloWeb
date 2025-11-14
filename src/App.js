import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import HeaderBar from "./components/HeaderBar";
import Container from "@mui/material/Container";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import RequireAuth from "./auth/RequireAuth";
import GestionesSearch from "./components/GestionesSearch";
import LoginPage from "./pages/Login";

/**
 * App - integra el login visual simple (AuthProvider) y protege la ruta /gestiones.
 * Rutas:
 *  - /login        -> Login visual (compara con src/config/auth.json)
 *  - /gestiones    -> Vista principal (protegida)
 *  - /             -> redirect a /gestiones
 *
 * Asegúrate de tener los archivos:
 *  - src/auth/AuthProvider.jsx
 *  - src/auth/RequireAuth.jsx
 *  - src/pages/Login.jsx
 *  - src/config/auth.json
 */

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <HeaderBar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/gestiones" replace />} />
              <Route
                path="/gestiones"
                element={
                  <RequireAuth>
                    <GestionesSearch />
                  </RequireAuth>
                }
              />
              {/* Añade aquí otras rutas protegidas si las necesitas */}
            </Routes>
          </Container>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}