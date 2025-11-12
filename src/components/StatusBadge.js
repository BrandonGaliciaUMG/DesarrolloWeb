import React from "react";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CancelIcon from "@mui/icons-material/Cancel";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

/**
 * StatusBadge
 * Props:
 *  - estado: { id, nombre, orden, is_terminal }
 *  - size (optional): "small" | "medium"
 */
export default function StatusBadge({ estado, size = "small" }) {
  if (!estado) return <Chip label="—" size={size} />;

  const nombre = estado.nombre || String(estado);
  const isTerminal = Boolean(estado.is_terminal);
  const label = nombre;

  let color = "default";
  let icon = null;
  if (/pendiente/i.test(nombre)) {
    color = "warning";
    icon = <HourglassTopIcon />;
  } else if (/en ?proceso/i.test(nombre)) {
    color = "info";
    icon = <PlayCircleIcon />;
  } else if (/finaliz/i.test(nombre) || (isTerminal && /final/i.test(nombre))) {
    color = "success";
    icon = <CheckCircleIcon />;
  } else if (/cancel/i.test(nombre)) {
    color = "error";
    icon = <CancelIcon />;
  } else {
    color = isTerminal ? "success" : "default";
  }

  return (
    <Tooltip title={label}>
      <Chip
        label={label}
        size={size}
        color={color}
        icon={icon}
        sx={{ fontWeight: 600 }}
      />
    </Tooltip>
  );
}