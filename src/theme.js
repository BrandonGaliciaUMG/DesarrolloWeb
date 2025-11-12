// Theme global MUI - paleta más vibrante / acentos adicionales
import { createTheme } from "@mui/material/styles";

const BRAND = "#0B5CAB";      // azul principal
const BRAND_LIGHT = "#E6F0FB";
const ACCENT = "#F97316";     // naranja acento
const ACCENT_LIGHT = "#FFF4EB";
const SUCCESS = "#10B981";    // verde
const DANGER = "#DC2626";     // rojo
const INFO = "#06B6D4";       // cian/acento secundario
const SURFACE = "#FFFFFF";
const PAGE_BG = "#F4F7FB";

const theme = createTheme({
  palette: {
    primary: { main: BRAND, light: BRAND_LIGHT, contrastText: "#ffffff" },
    secondary: { main: ACCENT, light: ACCENT_LIGHT, contrastText: "#ffffff" },
    success: { main: SUCCESS },
    error: { main: DANGER },
    info: { main: INFO },
    background: { default: PAGE_BG, paper: SURFACE },
    text: { primary: "#0f1724", secondary: "#475569" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontWeight: 700 },
    subtitle2: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          transition: "transform 200ms ease, box-shadow 200ms ease",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
        containedPrimary: {
          boxShadow: "0 6px 18px rgba(11,92,171,0.08)"
        }
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: "0 6px 18px rgba(16,24,40,0.06)"
        }
      }
    }
  },
  shape: { borderRadius: 12 },
  // tokens adicionales por conveniencia
  custom: {
    brand: BRAND,
    brandLight: BRAND_LIGHT,
    accent: ACCENT,
    accentLight: ACCENT_LIGHT,
    success: SUCCESS,
    danger: DANGER,
    info: INFO
  }
});

export default theme;