import React, { useEffect, useState, useMemo, useCallback } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";

import StatusBadge from "./StatusBadge";
import RelativeDate from "./RelativeDate";
import GestionStepper from "./GestionStepper";

/**
 * GestionDetail
 *
 * Props:
 *  - gestionId (optional): id to fetch from API (/api/gestiones/{id})
 *  - record (optional): pre-fetched normalized record object (used by GestionesSearch)
 *  - estadosCatalog (optional): array of estados (if provided, avoids fetching estados)
 *  - onOpenChangeModal (optional): callback to open change-state modal
 *
 * Behavior:
 *  - If `record` prop is provided, uses it directly and DOES NOT fetch the gestion.
 *  - Else, if `gestionId` is provided, fetches gestion and catalogos/estados.
 *  - Adds "Acciones rápidas" UI below stepper with stepwise restriction for pending states.
 *  - The bottom action buttons ("Agregar evento" / "Acción rápida") have been removed — quick actions above are the canonical way.
 */
export default function GestionDetail({ gestionId, record, estadosCatalog: estadosProp, onOpenChangeModal }) {
  const [gest, setGest] = useState(null);
  const [estados, setEstados] = useState(Array.isArray(estadosProp) ? estadosProp : []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick action UI state
  const [quickTarget, setQuickTarget] = useState(null); // estado id selected for quick transition
  const [quickComment, setQuickComment] = useState("");
  const [submittingQuick, setSubmittingQuick] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "info" });

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

  // Keep estados in sync if estadosProp changes
  useEffect(() => {
    if (Array.isArray(estadosProp) && estadosProp.length > 0) {
      setEstados(estadosProp);
    }
  }, [estadosProp]);

  // Reload function usable after a transition
  const reloadGestion = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const [estRes, gRes] = await Promise.all([
        Array.isArray(estadosProp) && estadosProp.length > 0
          ? Promise.resolve(estadosProp)
          : fetch(`${API_BASE}/api/catalogos/estados`).then(r => {
              if (!r.ok) throw new Error(`Error cargando estados: ${r.status}`);
              return r.json();
            }),
        fetch(`${API_BASE}/api/gestiones/${id}`).then(r => {
          if (!r.ok) {
            const e = new Error(`Gestión no encontrada (${r.status})`);
            e.status = r.status;
            throw e;
          }
          return r.json();
        })
      ]);
      setEstados(Array.isArray(estRes) ? estRes : []);
      setGest(gRes || null);
    } catch (err) {
      setError(String(err?.message || err));
      setGest(null);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, estadosProp]);

  // Load gestion when gestionId is provided; when record is provided use it instead.
  useEffect(() => {
    let cancelled = false;

    // If a pre-fetched record is provided, use it directly (no fetch for the gestion)
    if (record) {
      const normalized = {
        id: record.id ?? null,
        nombre: record.nombre ?? "",
        descripcion: record.descripcion ?? "",
        fecha_creacion: record.creada ?? record.fecha_creacion ?? record.fecha ?? null,
        estado_id: record.estado_id ?? null,
        estado_nombre: record.estado_nombre ?? null,
        responsable_nombre: record.responsable_nombre ?? record.responsable ?? "",
        etapas: Array.isArray(record.etapas) ? record.etapas : (Array.isArray(record.eventos) ? record.eventos : [])
      };
      setGest(normalized);
      // fetch estados in background only if not provided
      if (!Array.isArray(estadosProp) || estadosProp.length === 0) {
        (async () => {
          try {
            const r = await fetch(`${API_BASE}/api/catalogos/estados`);
            if (r.ok) {
              const d = await r.json();
              if (!cancelled) setEstados(Array.isArray(d) ? d : []);
            }
          } catch (e) {
            console.warn("No se pudieron cargar estados en background:", e);
          }
        })();
      }
      setLoading(false);
      setError(null);
    } else if (gestionId != null) {
      // fetch from API
      reloadGestion(gestionId);
    } else {
      // no id and no record -> clear
      setGest(null);
      setLoading(false);
      setError(null);
    }

    return () => {
      cancelled = true;
    };
  }, [gestionId, record, API_BASE, estadosProp, reloadGestion]);

  // Map estados by id
  const estadosMap = useMemo(() => {
    const m = new Map();
    if (Array.isArray(estados)) {
      estados.forEach(s => m.set(Number(s.id), s));
    }
    return m;
  }, [estados]);

  // currentEstado resolved from estadosMap
  const currentEstado = useMemo(() => {
    if (!gest || gest.estado_id == null) return undefined;
    return estadosMap.get(Number(gest.estado_id)) ?? { id: gest.estado_id, nombre: gest.estado_nombre ?? String(gest.estado_id) };
  }, [gest, estadosMap]);

  // stepper estados ordered
  const stepperEstados = useMemo(() => {
    if (!Array.isArray(estados)) return [];
    return [...estados].sort((a, b) => (Number(a.orden ?? 0) - Number(b.orden ?? 0)));
  }, [estados]);

  // possible quick targets: states with orden greater than current
  const possibleQuickTargetsBase = useMemo(() => {
    if (!currentEstado) return stepperEstados;
    const curOrden = Number(currentEstado.orden ?? 0);
    return stepperEstados.filter(e => Number(e.orden ?? 0) > curOrden);
  }, [stepperEstados, currentEstado]);

  // If the current state is "Pendiente" (name includes "pendiente"), don't allow direct "Finalizar" quick actions.
  // Allow only the immediate next stage (orden === curOrden+1) or "Cancelar".
  const possibleQuickTargets = useMemo(() => {
    if (!currentEstado) return possibleQuickTargetsBase;
    const name = String(currentEstado.nombre ?? "").toLowerCase();
    const curOrden = Number(currentEstado.orden ?? 0);

    if (/pendiente/i.test(name)) {
      return possibleQuickTargetsBase.filter(e => {
        const orden = Number(e.orden ?? 0);
        const enCanc = /cancel|cancelado|anular/i.test(String(e.nombre ?? ""));
        // allow cancel anytime from pendiente OR allow only the immediate next step
        return enCanc || orden === curOrden + 1;
      });
    }

    // otherwise allow all later steps (original behavior)
    return possibleQuickTargetsBase;
  }, [possibleQuickTargetsBase, currentEstado]);

  // Submit a quick transition (inline, without opening the modal)
  async function submitQuickTransition(targetId) {
    if (!gest || !gest.id) {
      setSnack({ open: true, msg: "Gestión no disponible para actualizar", severity: "error" });
      return;
    }
    setSubmittingQuick(true);
    try {
      const body = {
        usuario_id: null,
        comentario: quickComment || `Cambio rápido a estado ${targetId}`,
        estado_id: Number(targetId),
        apply_transition: true
      };
      const resp = await fetch(`${API_BASE}/api/gestiones/${gest.id}/eventos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => null);
        const msg = errBody?.detail || `Error al crear evento: ${resp.status}`;
        throw new Error(msg);
      }
      const data = await resp.json().catch(() => null);
      setSnack({ open: true, msg: "Transición realizada", severity: "success" });
      // reset quick UI
      setQuickComment("");
      setQuickTarget(null);
      // reload gestion from API to reflect new state
      await reloadGestion(gest.id);
    } catch (err) {
      console.error("submitQuickTransition error:", err);
      setSnack({ open: true, msg: String(err.message || err), severity: "error" });
    } finally {
      setSubmittingQuick(false);
    }
  }

  // Render states
  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="error">Error</Typography>
          <Typography variant="body2" color="text.secondary">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  if (!gest) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">No se encontró la gestión.</Typography>
        </Paper>
      </Container>
    );
  }

  const isTerminal = Boolean(currentEstado?.is_terminal);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar>{gest.responsable_nombre ? gest.responsable_nombre[0] : "?"}</Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{gest.nombre}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {gest.descripcion}
                </Typography>
              </Box>
            </Box>

            <Box textAlign="right">
              <StatusBadge estado={currentEstado} />
              <Box mt={1}>
                <Typography variant="caption" color="text.secondary">Creada:</Typography>
                <Box>
                  <RelativeDate value={gest.fecha_creacion} />
                </Box>
              </Box>
            </Box>
          </Box>

          <Divider />

          <GestionStepper
            estadosCatalog={stepperEstados}
            currentEstadoId={gest.estado_id}
            onStepClick={(e) => {
              if (isTerminal) {
                alert("Esta gestión está en un estado terminal; no se permiten cambios.");
                return;
              }
              if (onOpenChangeModal) onOpenChangeModal(e);
            }}
          />

          <Divider />

          {/* Quick actions: show next/terminal states as buttons so user can choose and comment inline */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Acciones rápidas</Typography>

            {possibleQuickTargets.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No hay transiciones disponibles.</Typography>
            ) : (
              <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                {possibleQuickTargets.map((t) => (
                  <Button
                    key={t.id}
                    variant={Number(t.id) === Number(quickTarget) ? "contained" : "outlined"}
                    color={t.is_terminal ? "error" : "primary"}
                    onClick={() => {
                      // toggle selection
                      if (String(quickTarget) === String(t.id)) {
                        setQuickTarget(null);
                        setQuickComment("");
                      } else {
                        setQuickTarget(t.id);
                        setQuickComment("");
                      }
                    }}
                    size="small"
                  >
                    {t.nombre}
                  </Button>
                ))}
              </Box>
            )}

            {/* Inline comment + confirm for the selected quick target */}
            {quickTarget && (
              <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Comentario para <strong>{(stepperEstados.find(s => Number(s.id) === Number(quickTarget)) || {}).nombre}</strong>
                </Typography>
                <TextField
                  value={quickComment}
                  onChange={(e) => setQuickComment(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Escribe un comentario (opcional)"
                  sx={{ mb: 1 }}
                />
                <Box display="flex" gap={1} justifyContent="flex-end">
                  <Button variant="text" onClick={() => { setQuickTarget(null); setQuickComment(""); }} disabled={submittingQuick}>Cancelar</Button>
                  <Button
                    variant="contained"
                    onClick={() => submitQuickTransition(quickTarget)}
                    disabled={submittingQuick}
                  >
                    {submittingQuick ? "Enviando..." : "Confirmar cambio"}
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Historial</Typography>
            {gest.etapas && gest.etapas.length > 0 ? (
              gest.etapas.map((et) => (
                <Paper
                  key={et.id ?? `${et.estado_id}-${et.fecha ?? ""}`}
                  variant="outlined"
                  sx={{
                    p: 1,
                    mb: 1,
                    borderColor: Number(et.estado_id) === Number(gest.estado_id) && isTerminal ? "error.main" : undefined
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {et.comentario || "(sin comentario)"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <strong>Estado:</strong> {et.estado_nombre || et.estado_id}
                        {" • "}
                        <strong>Usuario:</strong> {et.usuario_nombre ? et.usuario_nombre : (et.usuario_id ? `#${et.usuario_id}` : "Sistema / N/A")}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      {et.fecha ? <RelativeDate value={et.fecha} /> : <Typography variant="caption" color="text.secondary">Sin fecha registrada</Typography>}
                    </Box>
                  </Box>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">No hay eventos</Typography>
            )}
          </Box>

          {/* Bottom action buttons removed — quick actions above are used instead */}
        </Stack>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}