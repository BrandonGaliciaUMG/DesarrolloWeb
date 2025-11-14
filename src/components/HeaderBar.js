import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

/**
 * HeaderBar fusionado:
 * - Conserva el degradado naranja que tenías.
 * - Muestra usuario -> displayName y role, avatar y botón Logout en la esquina superior derecha.
 * - Si no hay usuario muestra el icono AccountCircle y botón Login.
 */

export default function HeaderBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // redirigir al login
    navigate("/login");
  };

  return (
    <AppBar
      position="static"
      elevation={6}
      sx={{
        // Degradado naranja: usa el color secundario y un tono más claro al final
        background: (theme) =>
          `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.custom?.accentLight ?? "#FFDEC6"} 100%)`,
        color: "common.white",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1.25 }}>
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, gap: 2 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{
              mr: 0.5,
              bgcolor: "transparent",
              borderRadius: 1,
              "&:hover": { bgcolor: "primary.200", opacity: 0.12 },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Marca: solo el nombre, sin avatar ni círculo 'ByF' */}
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 800, color: "common.white", letterSpacing: 0.2 }}
          >
            Banco ByF
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {user ? (
            <Box display="flex" alignItems="center" gap={1}>
              <Box textAlign="right" sx={{ mr: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "common.white" }}>
                  {user.displayName}
                </Typography>
                <Typography variant="caption" sx={{ color: "common.white" }}>
                  {user.role}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "secondary.main", width: 36, height: 36 }}>
                {user.displayName ? user.displayName[0].toUpperCase() : "U"}
              </Avatar>
              <Button color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
                Logout
              </Button>
            </Box>
          ) : (
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton color="inherit" aria-label="perfil" onClick={() => navigate("/login")}>
                <AccountCircle sx={{ color: "common.white" }} fontSize="large" />
              </IconButton>
              <Button color="inherit" href="/login">Login</Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}