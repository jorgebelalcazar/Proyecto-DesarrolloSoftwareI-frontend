import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Chip, Container, Stack, Typography } from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [api, setApi] = useState(null);
  const [error, setError] = useState(false);

  // Al cargar la página, consulta el endpoint de prueba del back-end
  useEffect(() => {
    axios
      .get(`${API_URL}/api/salud/`)
      .then((respuesta) => setApi(respuesta.data))
      .catch(() => setError(true));
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Sistema de gestión científica de conferencias
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Entorno de desarrollo: React + Vite + MUI
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
            {!api && !error && <Chip label="Consultando la API..." />}
            {error && <Chip label="Sin conexión con la API" color="error" />}
            {api && <Chip label={api.mensaje} color="success" />}
            {api && <Chip label={api.base_de_datos.split(" on ")[0]} color="primary" />}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

export default App;