import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";

export default function HeaderBar() {
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
          <IconButton color="inherit" aria-label="perfil">
            <AccountCircle sx={{ color: "common.white" }} fontSize="large" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}