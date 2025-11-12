import React, { useEffect, useState } from "react";
import { Box, Container, Snackbar, Alert } from "@mui/material";
import SearchBar from "./SearchBar";
import GestionDetail from "./GestionDetail";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function GestionesSearch() {
  const API_ESTADOS = `${API_BASE}/api/catalogos/estados`;
  const API_GESTION_BY_CODE = `${API_BASE}/api/gestiones`; // /api/gestiones/{code}

  const [estados, setEstados] = useState([]);
  const [record, setRecord] = useState(null);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "info" });
  const [loadingEstados, setLoadingEstados] = useState(false);

  useEffect(() => {
    const loadEstados = async () => {
      setLoadingEstados(true);
      try {
        const res = await fetch(API_ESTADOS);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setEstados(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error cargando estados:", e);
        setToast({ open: true, msg: "No se pudo cargar catálogo de estados", severity: "warning" });
      } finally {
        setLoadingEstados(false);
      }
    };
    loadEstados();
  }, [API_ESTADOS]);

  const doSearch = async (q) => {
    if (!q) return;
    setRecord(null);
    setToast({ open: false, msg: "", severity: "info" });

    if ((!estados || estados.length === 0) && !loadingEstados) {
      try {
        setLoadingEstados(true);
        const r = await fetch(API_ESTADOS);
        const d = r.ok ? await r.json().catch(() => []) : [];
        setEstados(Array.isArray(d) ? d : []);
      } catch (e) {
        console.warn("No se pudo recargar estados antes de buscar:", e);
      } finally {
        setLoadingEstados(false);
      }
    }

    try {
      const url = `${API_GESTION_BY_CODE}/${encodeURIComponent(q)}`;
      console.info("Buscando gestión en:", url);
      const res = await fetch(url);

      const ct = res.headers.get("content-type") || "";
      let body = null;
      if (ct.includes("application/json")) {
        body = await res.json().catch(() => null);
      } else {
        body = await res.text().catch(() => null);
      }

      if (!res.ok) {
        console.warn("Respuesta no OK:", res.status, body);
        if (res.status === 404) {
          setToast({ open: true, msg: "Gestión no encontrada (404).", severity: "warning" });
        } else if (res.status === 422) {
          setToast({ open: true, msg: (body && body.detail) || "Entrada inválida (422)", severity: "warning" });
        } else {
          setToast({ open: true, msg: (body && body.detail) || `Error servidor: ${res.status}`, severity: "error" });
        }
        return;
      }

      if (!body || typeof body !== "object") {
        setToast({ open: true, msg: "Respuesta inesperada del servidor", severity: "error" });
        console.error("Body inesperado:", body);
        return;
      }

      const normalized = {
        id: body.id ?? null,
        nombre: body.nombre ?? body.titulo ?? "",
        descripcion: body.descripcion ?? "",
        cliente: body.cliente ?? body.cliente_nombre ?? "",
        creada: body.creada ?? body.fecha_creacion ?? body.fecha ?? "",
        tipo: body.tipo ?? "",
        alerta: body.alerta ?? body.warning ?? "",
        estado_id: body.estado_id ?? null,
        estado_nombre: body.estado_nombre ?? body.estado_global ?? null,
        etapas: Array.isArray(body.etapas) ? body.etapas : (Array.isArray(body.eventos) ? body.eventos : []),
        responsable_id: body.responsable_id ?? null,
        responsable_nombre: body.responsable_nombre ?? ""
      };

      console.log("Gestión normalizada recibida:", normalized);
      setRecord(normalized);
    } catch (err) {
      console.error("doSearch error:", err);
      setToast({ open: true, msg: `Error de conexión con la API: ${err.message || err}`, severity: "error" });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <SearchBar onSearch={doSearch} />
      {record ? <GestionDetail record={record} estadosCatalog={estados} /> : null}
      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}