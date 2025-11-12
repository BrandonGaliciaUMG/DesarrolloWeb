import React, { useMemo } from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Box from "@mui/material/Box";
import StatusBadge from "./StatusBadge";

/**
 * GestionStepper
 * Props:
 *  - estadosCatalog: array of { id, nombre, orden, is_terminal } sorted by orden asc
 *  - currentEstadoId: id of the current estado
 *  - onStepClick(optional): function(stepEstado) called when user clicks a step
 *  - compact (optional): boolean for smaller layout
 */
export default function GestionStepper({ estadosCatalog = [], currentEstadoId = null, onStepClick, compact = false }) {
  const estados = useMemo(() => {
    return [...(estadosCatalog || [])].sort((a, b) => (Number(a.orden ?? 0) - Number(b.orden ?? 0)));
  }, [estadosCatalog]);

  const currentIndex = estados.findIndex(e => Number(e.id) === Number(currentEstadoId));
  const activeStep = currentIndex >= 0 ? currentIndex : 0;

  return (
    <Box sx={{ width: "100%", py: compact ? 1 : 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {estados.map((e, idx) => {
          const completed = idx < activeStep;
          const isActive = idx === activeStep;
          const isTerminalStep = Boolean(e.is_terminal);

          return (
            <Step key={e.id} completed={completed}>
              <StepLabel
                onClick={() => {
                  // no permitir click en terminal si se desea
                  if (isTerminalStep && typeof onStepClick === "function") {
                    // Allow viewing but not transitioning via clicking; caller can handle
                    onStepClick(e);
                    return;
                  }
                  onStepClick && onStepClick(e);
                }}
                sx={{
                  cursor: onStepClick ? "pointer" : "default",
                  ".MuiStepLabel-label": { fontSize: compact ? "0.85rem" : "0.95rem" },
                }}
                icon={<StatusBadge estado={e} size={compact ? "small" : "medium"} />}
              >
                <span style={{
                  fontWeight: isActive ? 700 : 500,
                  color: isTerminalStep ? "rgba(183,28,28,0.95)" : undefined
                }}>
                  {e.nombre}
                </span>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}