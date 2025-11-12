import React, { useState } from "react";
import { Box, TextField, Button, Stack, Chip } from "@mui/material";

/**
 * Props:
 * - onSearch(query: string)
 * - examples: string[] (opcional)
 */
export default function SearchBar({ onSearch, examples = [] }) {
  const [q, setQ] = useState("");

  const handleSearch = () => {
    const v = (q || "").trim();
    if (!v) return;
    onSearch(v);
  };

  return (
    <Box component="section" sx={{ mb: 3 }}>
      <Box sx={{ bgcolor: "white", borderRadius: 2, p: 2, boxShadow: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Número de Gestión"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            variant="outlined"
            size="medium"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ px: 3 }}
          >
            Consultar
          </Button>
        </Stack>

        {examples && examples.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
            {examples.map((ex) => (
              <Chip
                key={ex}
                label={ex}
                onClick={() => {
                  setQ(ex);
                  onSearch(ex);
                }}
                sx={{ cursor: "pointer" }}
                variant="outlined"
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}