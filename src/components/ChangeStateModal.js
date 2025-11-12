import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";

/**
 * ChangeStateModal
 * Props:
 *  - open: boolean
 *  - onClose: fn()
 *  - gestion: object { id, nombre, estado_id, tipo, ... }
 *  - estadosCatalog: array of estados (with id, nombre, orden, is_terminal)
 *  - usuario_id: current user id (used to post evento)
 *  - onSuccess: fn(newEvento) called after successful creation (use to re-fetch)
 *
 * Mejoras:
 *  - no permitir transiciones si la gestión está en estado terminal
 *  - mostrar mensaje claro si intento cambiar desde terminal
 */
export default function ChangeStateModal({ open, onClose, gestion, estadosCatalog = [], usuario_id = null, onSuccess }) {
  const [targetId, setTargetId] = useState("");
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isTerminal, setIsTerminal] = useState(false);

  useEffect(() => {
    if (open) {
      setTargetId("");
      setComentario("");
      setError(null);
    }
    if (gestion && Array.isArray(estadosCatalog)) {
      const cur = estadosCatalog.find(e => Number(e.id) === Number(gestion.estado_id));
      setIsTerminal(Boolean(cur?.is_terminal));
    } else {
      setIsTerminal(false);
    }
  }, [open, gestion, estadosCatalog]);

  if (!gestion) return null;

  // derive posible targets: choose estados with orden > current orden (simple heuristic)
  const current = estadosCatalog.find(e => Number(e.id) === Number(gestion.estado_id));
  const possible = estadosCatalog
    .filter(e => (current ? (Number(e.orden ?? 0) > Number(current.orden ?? 0)) : true))
    .sort((a,b) => (Number(a.orden ?? 0) - Number(b.orden ?? 0)));

  async function handleSubmit() {
    if (isTerminal) {
      setError("La gestión está en un estado terminal; no se permiten transiciones.");
      return;
    }
    if (!targetId) {
      setError("Selecciona un estado destino");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE || ""}/api/gestiones/${gestion.id}/eventos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id,
          comentario,
          estado_id: Number(targetId),
          apply_transition: true
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      onClose && onClose();
      onSuccess && onSuccess(data);
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cambiar estado - {gestion.nombre}</DialogTitle>
      <DialogContent>
        {isTerminal && <Alert severity="warning" sx={{ mb: 2 }}>La gestión está en estado terminal; no se permiten transiciones.</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography variant="body2" sx={{ mb: 1 }}>Estado actual: <strong>{current?.nombre || gestion.estado_id}</strong></Typography>

        <TextField
          select
          label="Estado destino"
          fullWidth
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          sx={{ mb: 2 }}
          disabled={isTerminal}
        >
          <MenuItem value="">-- Seleccionar --</MenuItem>
          {possible.map(s => (
            <MenuItem key={s.id} value={s.id}>
              {s.nombre} {s.is_terminal ? "(terminal)" : ""}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Comentario (opcional)"
          fullWidth
          multiline
          minRows={3}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          disabled={isTerminal}
        />

        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            Al confirmar, se creará un evento y se actualizará el estado de la gestión si la transición está permitida.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || isTerminal}>
          {submitting ? "Enviando..." : "Confirmar cambio"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}