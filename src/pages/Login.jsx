import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Button, TextField, Paper, Typography, Checkbox, FormControlLabel, Alert } from "@mui/material";
import { useAuth } from "../auth/AuthProvider";
import creds from "../config/auth.json";

/**
 * Login visual que compara con src/config/auth.json
 * Credenciales por defecto: admin / admin
 */

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/gestiones";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Comparación sencilla contra el archivo de credenciales importado
    if (username === creds.username && password === creds.password) {
      login(username, remember);
      navigate(from, { replace: true });
      return;
    }

    setError("Usuario o contraseña inválidos.");
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: "60vh" }}>
      <Paper sx={{ p: 4, width: 420 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Iniciar sesión</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth sx={{ mb: 1 }} />
          <FormControlLabel control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />} label="Recordarme" />
          <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="contained" type="submit">Entrar</Button>
          </Box>
        </form>
        
      </Paper>
    </Box>
  );
}