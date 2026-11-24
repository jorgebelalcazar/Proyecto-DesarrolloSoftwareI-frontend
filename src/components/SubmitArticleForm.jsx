import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import SaveIcon from "@mui/icons-material/Save";
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
  getArticleById,
  getThematicLines,
  updateArticleMetadata,
  uploadArticleInitialPdf,
} from "../services/articleService";

export const LINEAS_TEMATICAS_OFICIALES = [
  { id: 1, nombre: "Sistemas Inteligentes" },
  { id: 2, nombre: "Tecnologías en Informática" },
  { id: 3, nombre: "Educación en Informática" },
  { id: 4, nombre: "Sistemas de Software" },
  { id: 5, nombre: "Software en la práctica" },
];

function normalizeKeywords(rawKeywords) {
  if (Array.isArray(rawKeywords)) {
    return rawKeywords
      .map((item) => (typeof item === "string" ? item : item?.nombre || ""))
      .filter(Boolean);
  }
  if (typeof rawKeywords === "string" && rawKeywords.trim()) {
    return rawKeywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeCoauthors(rawCoauthors) {
  if (Array.isArray(rawCoauthors)) {
    return rawCoauthors
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.nombre_completo || item?.nombre || item?.email || ""
      )
      .filter(Boolean);
  }
  if (typeof rawCoauthors === "string" && rawCoauthors.trim()) {
    return rawCoauthors
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeThematicLineId(rawLine) {
  if (rawLine && typeof rawLine === "object") {
    return rawLine.id ?? "";
  }
  return rawLine ?? "";
}

export default function SubmitArticleForm({
  onCancel,
  onSuccess,
  initialArticle = null,
}) {
  const { id: routeArticleId } = useParams();
  const targetArticleId = initialArticle?.id ?? routeArticleId ?? null;
  const isEditMode = Boolean(targetArticleId);

  const [thematicLines, setThematicLines] = useState(
    LINEAS_TEMATICAS_OFICIALES
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [coauthorInput, setCoauthorInput] = useState("");
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfError, setPdfError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [loadingArticle, setLoadingArticle] = useState(
    Boolean(targetArticleId && !initialArticle)
  );
  const [editionBlockedReason, setEditionBlockedReason] = useState("");
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
      coautores: [],
    },
  });

  const resumenValue = watch("resumen") || "";
  const palabrasClave = watch("palabras_clave") || [];
  const coautores = watch("coautores") || [];
  const wordCount = countWords(resumenValue);
  const isOverWordLimit = wordCount > MAX_ABSTRACT_WORDS;

  // Cargar catálogo de líneas temáticas
  useEffect(() => {
    let active = true;
    getThematicLines()
      .then((lines) => {
        if (active && Array.isArray(lines) && lines.length > 0) {
          setThematicLines(lines);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Precargar metadatos cuando está en modo edición (HU-20.3)
  useEffect(() => {
    if (!isEditMode) return;
    let active = true;

    const applyArticleToForm = (articleData) => {
      reset(
        {
          titulo: articleData.titulo || "",
          linea_tematica: normalizeThematicLineId(articleData.linea_tematica),
          resumen: articleData.resumen || "",
          palabras_clave: normalizeKeywords(articleData.palabras_clave),
          coautores: normalizeCoauthors(articleData.coautores),
        },
        { keepDefaultValues: false }
      );

      const statusUpper = String(articleData.estado || "").toUpperCase();
      if (statusUpper === "DESHABILITADO" || articleData.puede_editar === false) {
        setEditionBlockedReason(
          "Este artículo está deshabilitado o fuera de la fecha límite de modificación."
        );
      }
    };

    if (initialArticle) {
      applyArticleToForm(initialArticle);
      setLoadingArticle(false);
      return;
    }

    setLoadingArticle(true);
    setServerError("");

    getArticleById(targetArticleId)
      .then((data) => {
        if (!active) return;
        applyArticleToForm(data);
      })
      .catch((err) => {
        if (!active) return;
        const status = err.response?.status;
        const detail =
          err.response?.data?.detail ||
          "No se pudieron cargar los datos del artículo para edición.";

        if (status === 400 || status === 403) {
          setEditionBlockedReason(detail);
        } else {
          setServerError(detail);
        }
      })
      .finally(() => {
        if (active) setLoadingArticle(false);
      });

        return () => {
      active = false;
    };
  }, [initialArticle, isEditMode, reset, targetArticleId]);

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

  const handleAddCoauthor = (rawValue) => {
    const clean = rawValue.replace(/,/g, "").trim();
    if (!clean) return;

    const exists = coautores.some(
      (item) => item.toLowerCase() === clean.toLowerCase()
    );
    if (!exists) {
      setValue("coautores", [...coautores, clean], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    setCoauthorInput("");
  };

  const handleCoauthorKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      handleAddCoauthor(coauthorInput);
    }
  };

  const handleDeleteCoauthor = (coauthorToDelete) => {
    setValue(
      "coautores",
      coautores.filter((item) => item !== coauthorToDelete),
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

    const payload = {
      titulo: formData.titulo.trim(),
      resumen: formData.resumen.trim(),
      linea_tematica: Number(formData.linea_tematica),
      palabras_clave: formData.palabras_clave,
      coautores: formData.coautores || [],
    };

    // Flujo 1: Modo Edición de metadatos (HU-20.3)
    if (isEditMode) {
      try {
        const updated = await updateArticleMetadata(targetArticleId, payload);
        setSuccessMessage(
          "Los datos del artículo se actualizaron correctamente."
        );
        onSuccess?.(updated);
      } catch (err) {
        const status = err.response?.status;
        const apiDetail =
          err.response?.data?.detail ||
          err.response?.data?.titulo?.[0] ||
          err.response?.data?.resumen?.[0] ||
          err.response?.data?.linea_tematica?.[0] ||
          err.response?.data?.palabras_clave?.[0] ||
          err.response?.data?.coautores?.[0] ||
          "No se pudieron guardar los cambios del artículo.";

        if (status === 400 || status === 403) {
          setEditionBlockedReason(apiDetail);
        } else {
          setServerError(apiDetail);
        }
      }
      return;
    }

    // Flujo 2: Modo Postulación Inicial + PDF (HU-14 / HU-16)
    const validationError = validatePdfFile(selectedPdf);
    if (validationError) {
      setPdfError(validationError);
      return;
    }

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
      setCoauthorInput("");
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

  const isFormDisabled = isSubmitting || Boolean(editionBlockedReason);

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
                  {isEditMode ? "Volver a Mis Artículos" : "Volver al panel principal"}
                </Button>
              )}

              <Typography
                variant="overline"
                sx={{
                  display: "block",
                  color: "#2859d8",
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                {isEditMode ? "Edición de Metadatos" : "Postulación de Ponencia"}
              </Typography>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {isEditMode
                  ? "Editar Datos del Artículo"
                  : "Proponer Nuevo Artículo"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {isEditMode
                  ? "Actualiza el título, línea temática, resumen, palabras clave o coautores antes de la fecha límite."
                  : "Registra los metadatos principales, selecciona la línea temática y adjunta tu manuscrito en PDF."}
              </Typography>
            </Box>

            <Divider />

            {editionBlockedReason && (
              <Alert severity="warning">{editionBlockedReason}</Alert>
            )}
            {serverError && <Alert severity="error">{serverError}</Alert>}
            {successMessage && <Alert severity="success">{successMessage}</Alert>}

            {loadingArticle ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <CircularProgress size={32} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1.5 }}
                >
                  Cargando metadatos actuales del artículo...
                </Typography>
              </Box>
            ) : (
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
                        disabled={isFormDisabled}
                        id="articulo-titulo"
                        label="Título del artículo"
                        placeholder="Ej. Arquitectura basada en microservicios para sistemas académicos"
                        error={Boolean(errors.titulo)}
                        helperText={
                          errors.titulo?.message ||
                          `${(field.value || "").length}/250 caracteres`
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
                        disabled={isFormDisabled}
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
                          disabled={isFormDisabled}
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
                      disabled={isFormDisabled}
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
                            disabled={isFormDisabled}
                            onDelete={() => handleDeleteKeyword(kw)}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* 5. Coautores */}
                  <Box>
                    <TextField
                      fullWidth
                      disabled={isFormDisabled}
                      id="articulo-coautores"
                      label="Coautores (opcional)"
                      placeholder="Escribe el nombre o correo del coautor y presiona Enter o coma (,)"
                      value={coauthorInput}
                      onChange={(e) => setCoauthorInput(e.target.value)}
                      onKeyDown={handleCoauthorKeyDown}
                      onBlur={() => handleAddCoauthor(coauthorInput)}
                      error={Boolean(errors.coautores)}
                      helperText={
                        errors.coautores?.message ||
                        "Agrega coautores si el trabajo fue elaborado en equipo."
                      }
                    />

                    {coautores.length > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.75,
                          mt: 1.5,
                        }}
                      >
                        {coautores.map((coauthor) => (
                          <Chip
                            key={coauthor}
                            label={coauthor}
                            color="secondary"
                            variant="outlined"
                            size="small"
                            disabled={isFormDisabled}
                            onDelete={() => handleDeleteCoauthor(coauthor)}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* 6. Zona Drag & Drop PDF solo para creación inicial */}
                  {!isEditMode && (
                    <PdfDropzoneField
                      file={selectedPdf}
                      error={pdfError}
                      uploadProgress={uploadProgress}
                      disabled={isSubmitting}
                      onFileSelect={handlePdfSelect}
                      onFileRemove={handlePdfRemove}
                    />
                  )}

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
                      disabled={
                        isFormDisabled ||
                        !isValid ||
                        (!isEditMode && !selectedPdf)
                      }
                      endIcon={
                        isSubmitting ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : isEditMode ? (
                          <SaveIcon />
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
                      {isSubmitting
                        ? isEditMode
                          ? "Guardando cambios..."
                          : "Registrando..."
                        : isEditMode
                        ? "Guardar cambios"
                        : "Registrar propuesta"}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}