import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";

export const LINEAS_TEMATICAS_OFICIALES = [
  { id: 1, nombre: "Sistemas Inteligentes" },
  { id: 2, nombre: "Tecnologías en Informática" },
  { id: 3, nombre: "Educación en Informática" },
  { id: 4, nombre: "Sistemas de Software" },
  { id: 5, nombre: "Software en la práctica" },
];

export default function SubmitArticleForm({ onCancel }) {
  const [titulo, setTitulo] = useState("");
  const [resumen, setResumen] = useState("");
  const [lineaTematica, setLineaTematica] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [palabrasClave, setPalabrasClave] = useState([]);

  const handleAddKeyword = (rawValue) => {
    const clean = rawValue.replace(/,/g, "").trim();
    if (!clean) return;

    const exists = palabrasClave.some(
      (item) => item.toLowerCase() === clean.toLowerCase()
    );
    if (!exists) {
      setPalabrasClave((prev) => [...prev, clean]);
    }
    setKeywordInput("");
  };

  const handleKeywordKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      handleAddKeyword(keywordInput);
    }
  };

  const handleDeleteKeyword = (keywordToDelete) => {
    setPalabrasClave((prev) =>
      prev.filter((item) => item !== keywordToDelete)
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // La lógica de validación Zod, contador de palabras y envío POST se conectan en HU-14.4
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Card
        elevation={1}
        sx={{
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          p: { xs: 2, sm: 4 },
        }}
      >
        <CardContent>
          <Stack spacing={3}>
            {/* Encabezado de la vista */}
            <Box>
              {onCancel && (
                <Button
                  variant="text"
                  size="small"
                  startIcon={<ArrowBackIcon />}
                  onClick={onCancel}
                  sx={{ textTransform: "none", mb: 1, ml: -1 }}
                >
                  Volver al panel principal
                </Button>
              )}

              <Typography
                variant="overline"
                sx={{ color: "#2859d8", fontWeight: 700, letterSpacing: 1 }}
              >
                Postulación de Ponencia
              </Typography>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Proponer Nuevo Artículo
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Registra los metadatos principales y selecciona la línea temática a la que se postula tu trabajo.
              </Typography>
            </Box>

            <Divider />

            {/* Formulario de Metadatos */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={3}>
                {/* 1. Título del artículo */}
                <TextField
                  fullWidth
                  required
                  id="articulo-titulo"
                  label="Título del artículo"
                  placeholder="Ej. Arquitectura basada en microservicios para sistemas académicos"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />

                {/* 2. Selector desplegable de las 5 Líneas Temáticas oficiales */}
                <TextField
                  select
                  fullWidth
                  required
                  id="articulo-linea-tematica"
                  label="Línea temática"
                  value={lineaTematica}
                  onChange={(e) => setLineaTematica(e.target.value)}
                  helperText="Selecciona una de las 5 líneas temáticas oficiales del evento."
                >
                  {LINEAS_TEMATICAS_OFICIALES.map((linea) => (
                    <MenuItem key={linea.id} value={linea.id}>
                      {linea.nombre}
                    </MenuItem>
                  ))}
                </TextField>

                {/* 3. Resumen (Abstract) */}
                <TextField
                  fullWidth
                  required
                  multiline
                  minRows={5}
                  maxRows={10}
                  id="articulo-resumen"
                  label="Resumen (Abstract)"
                  placeholder="Describe el objetivo, metodología y principales aportes del artículo..."
                  value={resumen}
                  onChange={(e) => setResumen(e.target.value)}
                />

                {/* 4. Palabras clave */}
                <Box>
                  <TextField
                    fullWidth
                    id="articulo-palabras-clave"
                    label="Palabras clave"
                    placeholder="Escribe una palabra clave y presiona Enter o coma (,)"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeywordKeyDown}
                    onBlur={() => handleAddKeyword(keywordInput)}
                    helperText="Agrega términos relevantes separados por Enter o coma."
                  />

                  {palabrasClave.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.75,
                        mt: 1.5,
                      }}
                    >
                      {palabrasClave.map((kw) => (
                        <Chip
                          key={kw}
                          label={kw}
                          color="primary"
                          variant="outlined"
                          size="small"
                          onDelete={() => handleDeleteKeyword(kw)}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Acciones del formulario */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  justifyContent="flex-end"
                  sx={{ pt: 1 }}
                >
                  {onCancel && (
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={onCancel}
                      sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                      Cancelar
                    </Button>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<SendIcon />}
                    sx={{
                      textTransform: "none",
                      px: 4,
                      borderRadius: 2,
                      bgcolor: "#2859d8",
                    }}
                  >
                    Registrar propuesta
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}