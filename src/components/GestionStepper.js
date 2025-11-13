import React, { useMemo } from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Box from "@mui/material/Box";
import StatusBadge from "./StatusBadge";
import { styled, useTheme } from "@mui/material/styles";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";

/**
 * Improved GestionStepper (updated connector visuals)
 * - Connector is rendered "behind" the step icons (z-index) so it no longer overlaps them
 * - Connector color changed to a soft light-green gradient instead of blue
 * - Opacity rules for past/future steps to make active step stand out
 */

const ColorConnector = styled(StepConnector)(({ theme }) => ({
  // make the connector sit visually behind icons by lowering z-index and nudging down
  [`& .${stepConnectorClasses.line}`]: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.palette.grey[300],
    opacity: 0.55,
    transition: "background 0.35s ease, opacity 0.35s ease, transform 0.35s ease",
    // nudge the line slightly down so it does not visually overlap circular icons
    transform: "translateY(6px)",
    zIndex: 0,
  },
  // active portion - light green gradient
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    background: `linear-gradient(90deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
    opacity: 1,
  },
  // completed portion - slightly stronger green
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    background: `linear-gradient(90deg, ${theme.palette.success.light} 0%, ${theme.palette.success.dark || theme.palette.success.main} 100%)`,
    opacity: 0.95,
  }
}));

export default function GestionStepper({ estadosCatalog = [], currentEstadoId = null, onStepClick, compact = false }) {
  const theme = useTheme();

  const estados = useMemo(() => {
    return [...(estadosCatalog || [])].sort((a, b) => (Number(a.orden ?? 0) - Number(b.orden ?? 0)));
  }, [estadosCatalog]);

  const currentIndex = estados.findIndex(e => Number(e.id) === Number(currentEstadoId));
  const activeStep = currentIndex >= 0 ? currentIndex : 0;

  return (
    <Box sx={{ width: "100%", py: compact ? 1 : 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel connector={<ColorConnector />}>
        {estados.map((e, idx) => {
          const completed = idx < activeStep;
          const isActive = idx === activeStep;
          // opacity rules: past steps slightly transparent, future more transparent, active full
          const iconOpacity = isActive ? 1 : (completed ? 0.75 : 0.45);
          const labelOpacity = isActive ? 1 : (completed ? 0.85 : 0.6);

          return (
            <Step key={e.id} completed={completed}>
              <StepLabel
                onClick={() => onStepClick && onStepClick(e)}
                sx={{
                  cursor: onStepClick ? "pointer" : "default",
                  ".MuiStepLabel-label": {
                    fontSize: compact ? "0.85rem" : "0.95rem",
                    fontWeight: isActive ? 700 : 600,
                    opacity: labelOpacity,
                    transition: "opacity 0.2s ease"
                  },
                  // ensure icon sits above the connector line
                  ".MuiStepLabel-iconContainer": {
                    zIndex: 3,
                    position: "relative",
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: "50%",
                    padding: "2px",
                    // also apply opacity similar to icon
                    opacity: iconOpacity,
                    transition: "opacity 0.2s ease, transform 0.2s ease"
                  }
                }}
                icon={<StatusBadge estado={e} size={compact ? "small" : "medium"} />}
              >
                <span style={{
                  display: "inline-block",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  maxWidth: 140,
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