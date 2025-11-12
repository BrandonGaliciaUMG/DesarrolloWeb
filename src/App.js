// App.js - envolver con ThemeProvider y CssBaseline
import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import HeaderBar from "./components/HeaderBar";
import GestionesSearch from "./components/GestionesSearch";
import Container from "@mui/material/Container";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HeaderBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <GestionesSearch />
      </Container>
    </ThemeProvider>
  );
}

export default App;