// src/components/ChangeStateDialog.js
import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box
} from "@mui/material";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function ChangeStateDialog({ open, onClose, gestion, targetState, onSuccess }) {
  const [comentario, setComentario] = useState("");
  const [required, setRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState("");

  useEffect(() => {
    if (!open) return;
    setComentario("");
    setTemplate("");
    setRequired(false);

    const loadPlantillas = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/catalogos/comentario-plantillas`);
        if (!res.ok) return;
        const list = await res.json();
        if (!Array.isArray(list)) return;
        const matches = list.filter(p => Number(p.estado_id) === Number(targetState.id));
        // priorizar tipo exacto (si gestion tiene campo tipo en el futuro)
        let chosen = null;
        if (matches.length > 0) {
          if (gestion && gestion.tipo) {
            chosen = matches.find(m => m.tipo_gestion && m.tipo_gestion.toString().toLowerCase() === gestion.tipo.toString().toLowerCase());
          }
          if (!chosen) chosen = matches.find(m => !m.tipo_gestion) || matches[0];
        }
        if (chosen) {
          setTemplate(chosen.template || "");
          setComentario(chosen.template || "");
          setRequired(Boolean(chosen.required));
        }
      } catch (e) {
        console.warn("No se pudo cargar plantillas:", e);
      }
    };
    loadPlantillas();
  }, [open, targetState, gestion]);

  const handleConfirm = async () => {
    if (required && (!comentario || comentario.trim() === "")) return;
    setLoading(true);
    try {
      const payload = {
        usuario_id: null,             // opcional: pasar id de usuario actual si tienes auth
        comentario: comentario,
        estado_id: targetState.id,
        apply_transition: true
      };
      const res = await fetch(`${API_BASE}/api/gestiones/${gestion.id}/eventos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      const evt = await res.json();
      onSuccess && onSuccess(evt);
      onClose();
    } catch (err) {
      console.error("Error aplicando transición:", err);
      alert(`Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={Boolean(open)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transicionar a: {targetState?.nombre}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">Escribe un comentario para la etapa</Typography>
        </Box>
        <TextField
          multiline
          minRows={4}
          fullWidth
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder={template || "Comentario (opcional)"}
        />
        {required && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
            Se requiere comentario para aplicar esta transición.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={loading || (required && (!comentario || comentario.trim() === ""))}>
          {loading ? "Aplicando..." : "Confirmar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}