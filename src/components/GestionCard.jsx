import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import StatusBadge from "./StatusBadge";
import RelativeDate from "./RelativeDate";

/**
 * GestionCard - tarjeta compacta para el listado
 * Props:
 *  - gestion: object returned by /api/gestiones (id, nombre, descripcion, estado_id, fecha_creacion, responsable_nombre, etc)
 *  - currentEstado: object (catalogo estado) for the gestion.estado_id
 *  - onOpen: function to open detail (receives gestion.id)
 */
export default function GestionCard({ gestion, currentEstado, onOpen }) {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" gap={2} alignItems="center" sx={{ minWidth: 0 }}>
            <Avatar>
              {gestion?.responsable_nombre
                ? String(gestion.responsable_nombre).charAt(0).toUpperCase()
                : "?"}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                {gestion?.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {gestion?.descripcion || "—"}
              </Typography>
            </Box>
          </Box>

          <Stack spacing={1} alignItems="flex-end">
            <StatusBadge estado={currentEstado} />
            <Typography variant="caption" color="text.secondary">
              Creada: <RelativeDate value={gestion?.fecha_creacion} />
            </Typography>
          </Stack>
        </Box>
      </CardContent>

      <CardActions>
        <Box sx={{ ml: 1 }}>
          <Button size="small" onClick={() => onOpen && onOpen(gestion.id)}>
            Abrir
          </Button>
        </Box>
        <Box sx={{ flex: "1 1 auto" }} />
        <Button size="small" onClick={() => onOpen && onOpen(gestion.id)}>
          Ver historial
        </Button>
      </CardActions>
    </Card>
  );
}