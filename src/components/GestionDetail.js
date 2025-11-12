import React, { useEffect, useState, useMemo } from "react";
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

import StatusBadge from "./StatusBadge";
import RelativeDate from "./RelativeDate";
import GestionStepper from "./GestionStepper";

/**
 * GestionDetail - componente con hooks correctamente ordenados y mejoras:
 *  - fallbacks para fechas y usuarios nulos en las etapas
 *  - evita abrir modal de cambio si la gestión está en estado terminal
 *
 * Props:
 *  - gestionId (required) : id de la gestión a cargar
 *  - onOpenChangeModal (optional): callback para abrir modal de cambio de estado
 */
export default function GestionDetail({ gestionId, onOpenChangeModal }) {
  const [gest, setGest] = useState(null);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_BASE || "";

  // Hooks: siempre colocados en la cima del componente
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [estRes, gRes] = await Promise.all([
          fetch(`${API_BASE}/api/catalogos/estados`).then((r) => {
            if (!r.ok) throw new Error("Error cargando estados");
            return r.json();
          }),
          // DEBUG: fetch con logging de error detallado
          (async () => {
            const resp = await fetch(`${API_BASE}/api/gestiones/${gestionId}`);
            if (!resp.ok) {
              const text = await resp.text().catch(() => null);
              throw new Error(`GET /api/gestiones/${gestionId} -> ${resp.status} ${resp.statusText} ${text ?? ""}`);
            }
            return resp.json();
          })(),
        ]);
        if (cancelled) return;
        setEstados(estRes || []);
        setGest(gRes || null);
      } catch (err) {
        if (!cancelled) setError(String(err?.message || err));
        setGest(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (gestionId != null) {
      load();
    } else {
      setGest(null);
      setEstados([]);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [gestionId, API_BASE]);

  // Map de estados por id para búsquedas rápidas
  const estadosMap = useMemo(() => {
    const m = new Map();
    if (Array.isArray(estados)) {
      for (const s of estados) {
        m.set(Number(s.id), s);
      }
    }
    return m;
  }, [estados]);

  // Estado actual objeto (o undefined)
  const currentEstado = useMemo(() => {
    if (!gest || !gest.estado_id) return undefined;
    return estadosMap.get(Number(gest.estado_id));
  }, [gest, estadosMap]);

  // Estados ordenados para el Stepper
  const stepperEstados = useMemo(() => {
    if (!Array.isArray(estados)) return [];
    return [...estados].sort((a, b) => (Number(a.orden ?? 0) - Number(b.orden ?? 0)));
  }, [estados]);

  // Render handling
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
              // por defecto abrimos el modal de cambio si se provee callback
              if (isTerminal) {
                // proteger: no abrir modal si gestión terminal
                // puedes reemplazar alert por snackbar en tu app
                alert("Esta gestión está en un estado terminal; no se permiten cambios.");
                return;
              }
              if (onOpenChangeModal) onOpenChangeModal(e);
            }}
          />

          <Divider />

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Historial</Typography>
            {gest.etapas && gest.etapas.length > 0 ? (
              gest.etapas.map((et) => (
                <Paper
                  key={et.id}
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

          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => {
                if (isTerminal) {
                  alert("Esta gestión está en estado terminal; no se permiten nuevas transiciones.");
                  return;
                }
                onOpenChangeModal && onOpenChangeModal();
              }}
            >
              Agregar evento
            </Button>
            <Button variant="contained">Acción rápida</Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}