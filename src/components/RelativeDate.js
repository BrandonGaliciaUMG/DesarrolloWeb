import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

/**
 * RelativeDate - interpreta strings sin zona como UTC (añade 'T' y 'Z' si hace falta)
 */
export default function RelativeDate({ value, showTime = true, variant = "body2" }) {
  if (!value) return <Typography variant={variant} component="span">—</Typography>;

  let date;
  try {
    if (typeof value === "string") {
      // Normalizar formatos comunes: "YYYY-MM-DD HH:MM:SS[.ffffff]" -> "YYYY-MM-DDTHH:MM:SS[.ffffff]Z"
      let s = value.trim();
      // si ya tiene 'T' or timezone info, dejarlo
      const hasT = s.includes("T");
      const hasZone = /[zZ]|[+\-]\d{2}:?\d{2}$/.test(s);
      if (!hasT) {
        s = s.replace(" ", "T");
      }
      if (!hasZone) {
        // asumimos UTC para timestamps sin zona
        s = s + "Z";
      }
      date = parseISO(s);
    } else {
      date = value instanceof Date ? value : parseISO(String(value));
    }
  } catch (err) {
    // fallback: mostrar raw
    return <Typography variant={variant} component="span">{String(value)}</Typography>;
  }

  const rel = formatDistanceToNow(date, { addSuffix: true, locale: es });
  const full = showTime ? format(date, "yyyy-MM-dd HH:mm:ss", { locale: es }) : format(date, "yyyy-MM-dd", { locale: es });

  return (
    <Tooltip title={full}>
      <Typography variant={variant} component="span" sx={{ fontWeight: 500 }}>{rel}</Typography>
    </Tooltip>
  );
}