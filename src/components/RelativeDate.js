import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

/**
 * RelativeDate
 * Props:
 *  - value: ISO string or Date
 *  - showTime (optional): true => include time in tooltip
 *  - variant (optional): MUI Typography variant
 */
export default function RelativeDate({ value, showTime = true, variant = "body2" }) {
  if (!value) return <Typography variant={variant}>—</Typography>;

  let date;
  try {
    date = typeof value === "string" ? parseISO(value) : value;
  } catch (err) {
    // fallback: show raw
    return <Typography variant={variant}>{String(value)}</Typography>;
  }

  const rel = formatDistanceToNow(date, { addSuffix: true, locale: es });
  const full = showTime ? format(date, "yyyy-MM-dd HH:mm:ss", { locale: es }) : format(date, "yyyy-MM-dd", { locale: es });

  return (
    <Tooltip title={full}>
      <Typography variant={variant} component="span" sx={{ fontWeight: 500 }}>
        {rel}
      </Typography>
    </Tooltip>
  );
}