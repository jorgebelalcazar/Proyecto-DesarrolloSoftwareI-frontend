import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import PdfDropzoneField from "./PdfDropzoneField";
import {
  articleSchema,
  countWords,
  MAX_ABSTRACT_WORDS,
  validatePdfFile,
} from "../validations/articleSchema";
import {
  createArticleProposal,
  getThematicLines,
  uploadArticleInitialPdf,
} from "../services/articleService";

export const LINEAS_TEMATICAS_OFICIALES = [
  { id: 1, nombre: "Sistemas Inteligentes" },
  { id: 2, nombre: "Tecnologías en Informática" },
  { id: 3, nombre: "Educación en Informática" },
  { id: 4, nombre: "Sistemas de Software" },
  { id: 5, nombre: "Software en la práctica" },
];

export default function SubmitArticleForm({ onCancel, onSuccess }) {
  const [thematicLines, setThematicLines] = useState(
    LINEAS_TEMATICAS_OFICIALES
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfError, setPdfError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(articleSchema),
    mode: "onChange",
    defaultValues: {
      titulo: "",
      linea_tematica: "",
      resumen: "",
      palabras_clave: [],
    },
  });

  const resumenValue = watch("resumen") || "";
  const palabrasClave = watch("palabras_clave") || [];
  const wordCount = countWords(resumenValue);
  const isOverWordLimit = wordCount > MAX_ABSTRACT_WORDS;

  useEffect(() => {
    let active = true;
    getThematicLines()
      .then((lines) => {
        if (active && Array.isArray(lines) && lines.length > 0) {
          setThematicLines(lines);
        }
      })
      .catch(() => {
        // Mantiene el catálogo oficial local como respaldo
      });
    return () => {
      active = false;
    };
  }, []);

  const handleAddKeyword = (rawValue) => {
    const clean = rawValue.replace(/,/g, "").trim();
    if (!clean) return;

    const exists = palabrasClave.some(
      (item) => item.toLowerCase() === clean.toLowerCase()
    );
    if (!exists) {
      setValue("palabras_clave", [...palabrasClave, clean], {
        shouldValidate: true,
        shouldDirty: true,
      });
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
    setValue(
      "palabras_clave",
      palabrasClave.filter((item) => item !== keywordToDelete),
      { shouldValidate: true, shouldDirty: true }
    );
  };

  const handlePdfSelect = (file) => {
    const validationError = validatePdfFile(file);
    if (validationError) {
      setPdfError(validationError);
      setSelectedPdf(null);
      return;
    }
    setPdfError("");
    setSelectedPdf(file);
  };

  const handlePdfRemove = () => {
    setSelectedPdf(null);
    setPdfError("");
    setUploadProgress(null);
  };

  const onSubmit = async (formData) => {
    setServerError("");
    setSuccessMessage("");

    const validationError = validatePdfFile(selectedPdf);
    if (validationError) {
      setPdfError(validationError);
      return;
    }

    const payload = {
      titulo: formData.titulo.trim(),
      resumen: formData.resumen.trim(),
      linea_tematica: Number(formData.linea_tematica),
      palabras_clave: formData.palabras_clave,
    };

    try {
      const created = await createArticleProposal(payload);
      const articleId = created?.id || created?.articulo_id;

      if (articleId && selectedPdf) {
        setUploadProgress(0);
        await uploadArticleInitialPdf(articleId, selectedPdf, (percent) => {
          setUploadProgress(percent);
        });
      }

      setSuccessMessage(
        "¡Artículo postulado y manuscrito PDF cargado exitosamente!"
      );
      reset();
      setKeywordInput("");
      setSelectedPdf(null);
      setPdfError("");
      setUploadProgress(null);
      onSuccess?.(created);
    } catch (err) {
      setUploadProgress(null);
      const apiDetail =
        err.response?.data?.detail ||
        err.response?.data?.archivo?.[0] ||
        err.response?.data?.titulo?.[0] ||
        err.response?.data?.resumen?.[0] ||
        err.response?.data?.linea_tematica?.[0] ||
        "No se pudo completar el registro de la propuesta o la carga del PDF.";
      setServerError(apiDetail);
    }
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
                Registra los metadatos principales, selecciona la línea temática y adjunta tu manuscrito en PDF.
              </Typography>
            </Box>

            <Divider />

            {serverError && <Alert severity="error">{serverError}</Alert>}
            {successMessage && <Alert severity="success">{successMessage}</Alert>}

            {/* Formulario de Metadatos y PDF */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={3}>
                {/* 1. Título del artículo */}
                <Controller
                  name="titulo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      required
                      id="articulo-titulo"
                      label="Título del artículo"
                      placeholder="Ej. Arquitectura basada en microservicios para sistemas académicos"
                      error={Boolean(errors.titulo)}
                      helperText={
                        errors.titulo?.message ||
                        `${field.value.length}/250 caracteres`
                      }
                    />
                  )}
                />

                {/* 2. Selector desplegable de las 5 Líneas Temáticas oficiales */}
                <Controller
                  name="linea_tematica"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      required
                      id="articulo-linea-tematica"
                      label="Línea temática"
                      error={Boolean(errors.linea_tematica)}
                      helperText={
                        errors.linea_tematica?.message ||
                        "Selecciona una de las 5 líneas temáticas oficiales del evento."
                      }
                    >
                      {thematicLines.map((linea) => (
                        <MenuItem key={linea.id} value={linea.id}>
                          {linea.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* 3. Resumen (Abstract) con contador dinámico de palabras (máx. 300) */}
                <Box>
                  <Controller
                    name="resumen"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        required
                        multiline
                        minRows={5}
                        maxRows={10}
                        id="articulo-resumen"
                        label="Resumen (Abstract)"
                        placeholder="Describe el objetivo, metodología y principales aportes del artículo..."
                        error={Boolean(errors.resumen) || isOverWordLimit}
                        helperText={errors.resumen?.message}
                      />
                    )}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color={
                        isOverWordLimit
                          ? "error.main"
                          : wordCount >= 270
                          ? "warning.main"
                          : "text.secondary"
                      }
                    >
                      {wordCount} / {MAX_ABSTRACT_WORDS} palabras
                    </Typography>
                  </Box>
                </Box>

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
                    error={Boolean(errors.palabras_clave)}
                    helperText={
                      errors.palabras_clave?.message ||
                      "Agrega términos relevantes separados por Enter o coma."
                    }
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

                {/* 5. Zona Drag & Drop con filtro cliente <= 10 MB y barra de progreso */}
                <PdfDropzoneField
                  file={selectedPdf}
                  error={pdfError}
                  uploadProgress={uploadProgress}
                  disabled={isSubmitting}
                  onFileSelect={handlePdfSelect}
                  onFileRemove={handlePdfRemove}
                />

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
                      disabled={isSubmitting}
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
                    disabled={!isValid || !selectedPdf || isSubmitting}
                    endIcon={
                      isSubmitting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <SendIcon />
                      )
                    }
                    sx={{
                      textTransform: "none",
                      px: 4,
                      borderRadius: 2,
                      bgcolor: "#2859d8",
                    }}
                  >
                    {isSubmitting ? "Registrando..." : "Registrar propuesta"}
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