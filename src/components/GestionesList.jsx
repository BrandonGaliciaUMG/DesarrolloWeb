import React, { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

import DashboardCards from "./DashboardCards";
import GestionCard from "./GestionCard";
import GestionDetail from "./GestionDetail";
import ChangeStateModal from "./ChangeStateModal";
import RelativeDate from "./RelativeDate";

/**
 * GestionesList - fusiona la tabla original + tarjetas + detalle lateral
 *
 * Comportamiento:
 * - Carga simultánea de gestiones, usuarios y estados
 * - Muestra DashboardCards con contadores
 * - Izquierda: lista (tabla) con gestiones y botones para abrir detalle
 * - Derecha: detalle (GestionDetail) para la gestión seleccionada
 * - ChangeStateModal global para cambiar estado de la gestión seleccionada
 */
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function GestionesList() {
  const [gestiones, setGestiones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [currentUserId] = useState(1); // adaptar según auth real

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, uRes, eRes] = await Promise.all([
        fetch(`${API_BASE}/api/gestiones/`),
        fetch(`${API_BASE}/api/usuarios/`),
        fetch(`${API_BASE}/api/catalogos/estados`)
      ]);
      if (!gRes.ok) throw new Error(`gestiones: ${gRes.status}`);
      if (!uRes.ok) throw new Error(`usuarios: ${uRes.status}`);
      if (!eRes.ok) throw new Error(`estados: ${eRes.status}`);

      const [gData, uData, eData] = await Promise.all([gRes.json(), uRes.json(), eRes.json()]);
      setGestiones(Array.isArray(gData) ? gData : []);
      setUsuarios(Array.isArray(uData) ? uData : []);
      setEstados(Array.isArray(eData) ? eData : []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setGestiones([]);
      setUsuarios([]);
      setEstados([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const getUsuarioNombre = (id) => {
    const user = usuarios.find(u => Number(u.id) === Number(id));
    return user ? user.nombre : (id ?? "—");
  };

  const getEstadoNombre = (id) => {
    const estado = estados.find(e => Number(e.id) === Number(id));
    return estado ? estado.nombre : (id ?? "—");
  };

  // Counters (ajusta los IDs de estado si tu catálogo es distinto)
  const total = gestiones.length;
  const enProceso = gestiones.filter(g => Number(g.estado_id) === 2).length;
  const finalizadas = gestiones.filter(g => Number(g.estado_id) === 3).length;
  const canceladas = gestiones.filter(g => Number(g.estado_id) === 4).length;

  function openDetail(id) {
    setSelectedId(String(id));
  }

  function closeDetail() {
    setSelectedId(null);
  }

  function openChangeModalForSelected() {
    setChangeModalOpen(true);
  }

  async function handleChangeSuccess() {
    // Re-fetch to reflect changes both in list and detail
    await fetchAll();
    setChangeModalOpen(false);
  }

  if (loading) {
    return (
      <Box textAlign="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <DashboardCards
        total={total}
        enProceso={enProceso}
        finalizadas={finalizadas}
        canceladas={canceladas}
      />

      <Grid container spacing={2}>
        {/* Left column: table / list */}
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6">Lista de Gestiones</Typography>
            <Box>
              <IconButton onClick={fetchAll} aria-label="refresh">
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Id</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Responsable</TableCell>
                  <TableCell>Creación</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {gestiones.map(gestion => (
                  <TableRow key={gestion.id} hover>
                    <TableCell>{gestion.id}</TableCell>
                    <TableCell style={{ maxWidth: 260 }}>{gestion.nombre}</TableCell>
                    <TableCell>{getEstadoNombre(gestion.estado_id)}</TableCell>
                    <TableCell>{getUsuarioNombre(gestion.responsable_id)}</TableCell>
                    <TableCell>
                      <RelativeDate value={gestion.fecha_creacion} />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => openDetail(gestion.id)}>Ver</Button>
                      <Button size="small" onClick={() => { openDetail(gestion.id); openChangeModalForSelected(); }}>Cambiar Estado</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Compact card list below table for mobile / alternative view */}
          <Box mt={2} display={{ xs: "block", md: "none" }}>
            {gestiones.map(g => {
              const currentEstado = estados.find(s => Number(s.id) === Number(g.estado_id));
              return <GestionCard key={g.id} gestion={g} currentEstado={currentEstado} onOpen={openDetail} />;
            })}
          </Box>
        </Grid>

        {/* Right column: detail */}
        <Grid item xs={12} md={6}>
          {selectedId ? (
            <Paper sx={{ p: 2 }}>
              <GestionDetail gestionId={selectedId} onOpenChangeModal={() => setChangeModalOpen(true)} />
              <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                <Button variant="outlined" onClick={closeDetail}>Cerrar</Button>
                <Button variant="contained" onClick={() => setChangeModalOpen(true)}>Cambiar estado</Button>
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 3 }}>
              <Typography variant="body1" color="text.secondary">Selecciona una gestión para ver su detalle.</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      <ChangeStateModal
        open={changeModalOpen}
        onClose={() => setChangeModalOpen(false)}
        gestion={gestiones.find(x => String(x.id) === String(selectedId))}
        estadosCatalog={estados}
        usuario_id={currentUserId}
        onSuccess={handleChangeSuccess}
      />
    </Box>
  );
}