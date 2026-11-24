import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ArticleIcon from "@mui/icons-material/Article";
import GroupIcon from "@mui/icons-material/Group";
import CategoryIcon from "@mui/icons-material/Category";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { getArticleDetail } from "../services/articleService";

const STATUS_CHIP_MAP = {
  BORRADOR: { label: "Borrador", color: "default" },
  ENVIADO: { label: "Enviado", color: "info" },
  POSTULADO: { label: "Postulado", color: "info" },
  EN_REVISION: { label: "En revisión", color: "warning" },
  APROBADO: { label: "Aprobado", color: "success" },
  ACEPTADO: { label: "Aceptado", color: "success" },
  RECHAZADO: { label: "Rechazado", color: "error" },
};

function formatDate(dateString) {
  if (!dateString) return "No registrada";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function extractSignedPdfUrl(article) {
  if (!article) return null;
  return (
    article.signed_url ||
    article.url_pdf ||
    article.pdf_url ||
    article.archivo_url ||
    null
  );
}

function buildOrderedSigners(article) {
  if (!article) return [];

  // Si el backend ya devuelve una lista unificada de firmantes
  if (Array.isArray(article.firmantes) && article.firmantes.length > 0) {
    return [...article.firmantes].sort(
      (a, b) => (a.orden ?? 999) - (b.orden ?? 999)
    );
  }

  const signers = [];
  const mainAuthor = article.autor_principal || article.autor;

  if (mainAuthor && typeof mainAuthor === "object") {
    signers.push({
      id: mainAuthor.id ?? "main-author",
      nombre:
        mainAuthor.nombre ||
        `${mainAuthor.nombres || ""} ${mainAuthor.apellidos || ""}`.trim() ||
        "Autor principal",
      correo: mainAuthor.correo || mainAuthor.email || "",
      afiliacion: mainAuthor.afiliacion || "",
      orden: 1,
      esPrincipal: true,
    });
  } else if (typeof mainAuthor === "string" && mainAuthor.trim()) {
    signers.push({
      id: "main-author",
      nombre: mainAuthor.trim(),
      correo: article.autor_correo || "",
      afiliacion: article.autor_afiliacion || "",
      orden: 1,
      esPrincipal: true,
    });
  }

  const rawCoauthors = Array.isArray(article.coautores) ? article.coautores : [];
  const sortedCoauthors = [...rawCoauthors].sort(
    (a, b) =>
      (a.orden ?? a.orden_autoria ?? 999) - (b.orden ?? b.orden_autoria ?? 999)
  );

  sortedCoauthors.forEach((coauthor, idx) => {
    const email = coauthor.correo || coauthor.email || "";
    const alreadyAdded =
      email && signers.some((s) => s.correo && s.correo === email);
    if (alreadyAdded) return;

    signers.push({
      id: coauthor.id ?? `coauthor-${idx}`,
      nombre:
        coauthor.nombre ||
        `${coauthor.nombres || ""} ${coauthor.apellidos || ""}`.trim() ||
        "Coautor",
      correo: email,
      afiliacion: coauthor.afiliacion || "",
      orden: coauthor.orden ?? coauthor.orden_autoria ?? signers.length + 1,
      esPrincipal: Boolean(coauthor.es_principal),
    });
  });

  return signers.sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999));
}

export default function ArticleDetailModal({ open, articleId, onClose }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openingPdf, setOpeningPdf] = useState(false);
  const [error, setError] = useState("");
  const [pdfError, setPdfError] = useState("");

  useEffect(() => {
    if (!open || !articleId) return;

    let active = true;
    setLoading(true);
    setError("");
    setPdfError("");

    getArticleDetail(articleId)
      .then((data) => {
        if (active) setArticle(data);
      })
      .catch((err) => {
        if (!active) return;
        setArticle(null);
        setError(
          err.response?.data?.detail ||
            "No se pudo cargar la ficha técnica del artículo."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, articleId]);

  const orderedSigners = useMemo(() => buildOrderedSigners(article), [article]);
  const initialSignedUrl = extractSignedPdfUrl(article);

  const thematicLine =
    typeof article?.linea_tematica === "object"
      ? article?.linea_tematica?.nombre
      : article?.linea_tematica_nombre || article?.linea_tematica || "Sin línea asignada";

  const keywords = useMemo(() => {
    if (!Array.isArray(article?.palabras_clave)) return [];
    return article.palabras_clave
      .map((kw) => (typeof kw === "string" ? kw : kw?.nombre || kw?.palabra || ""))
      .filter(Boolean);
  }, [article]);

  const statusConfig = STATUS_CHIP_MAP[article?.estado] || {
    label: article?.estado || "Registrado",
    color: "primary",
  };

  const handleOpenSignedPdf = async () => {
    if (!articleId) return;
    setOpeningPdf(true);
    setPdfError("");

    try {
      // Solicita una URL firmada fresca al servidor para evitar enlaces expirados
      const freshData = await getArticleDetail(articleId);
      setArticle(freshData);

      const freshUrl = extractSignedPdfUrl(freshData);
      if (!freshUrl) {
        setPdfError("Este artículo aún no tiene un archivo PDF disponible.");
        return;
      }

      window.open(freshUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setPdfError(
        err.response?.data?.detail ||
          "No se pudo generar el enlace temporal para abrir el PDF."
      );
    } finally {
      setOpeningPdf(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      aria-labelledby="article-detail-title"
    >
      <DialogTitle
        id="article-detail-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          bgcolor: "#f8fafc",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ArticleIcon color="primary" />
          <Typography variant="h6" fontWeight={700} color="#1d3150">
            Ficha técnica del artículo
          </Typography>
        </Stack>

        <IconButton onClick={onClose} aria-label="Cerrar ficha técnica" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 6 }}>
            <CircularProgress size={36} />
            <Typography variant="body2" color="text.secondary">
              Cargando ficha técnica y firmantes...
            </Typography>
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : article ? (
          <Stack spacing={3}>
            {/* Encabezado: Título y estado */}
            <Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1.5}
                sx={{ mb: 1 }}
              >
                <Typography variant="overline" color="text.secondary" fontWeight={700}>
                  Artículo #{article.id}
                </Typography>
                <Chip
                  label={statusConfig.label}
                  color={statusConfig.color}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              <Typography variant="h5" fontWeight={700} color="#0f172a">
                {article.titulo}
              </Typography>
            </Box>

            {/* Metadatos principales */}
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 2, bgcolor: "#f8fafc" }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                divider={<Divider orientation="vertical" flexItem />}
              >
                <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flex: 1 }}>
                  <CategoryIcon color="primary" fontSize="small" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Línea temática
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {thematicLine}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flex: 1 }}>
                  <CalendarTodayIcon color="primary" fontSize="small" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Fecha de postulación
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatDate(article.fecha_creacion || article.created_at)}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>

            {/* Resumen */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#1d3150" gutterBottom>
                Resumen (Abstract)
              </Typography>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{
                  lineHeight: 1.7,
                  whiteSpace: "pre-line",
                  bgcolor: "#ffffff",
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                {article.resumen || "Sin resumen registrado."}
              </Typography>
            </Box>

            {/* Palabras clave */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#1d3150" gutterBottom>
                Palabras clave
              </Typography>
              {keywords.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {keywords.map((kw, index) => (
                    <Chip
                      key={`${kw}-${index}`}
                      label={kw}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No se registraron palabras clave.
                </Typography>
              )}
            </Box>

            {/* Lista ordenada de firmantes */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <GroupIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700} color="#1d3150">
                  Lista ordenada de firmantes ({orderedSigners.length})
                </Typography>
              </Stack>

              {orderedSigners.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay firmantes registrados para este artículo.
                </Typography>
              ) : (
                <Stack spacing={1.25}>
                  {orderedSigners.map((signer, index) => (
                    <Paper
                      key={signer.id}
                      variant="outlined"
                      sx={{
                        p: 1.75,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: 14,
                            fontWeight: 700,
                            bgcolor: signer.esPrincipal ? "#1d3150" : "#e2e8f0",
                            color: signer.esPrincipal ? "#ffffff" : "#1e293b",
                          }}
                        >
                          {index + 1}
                        </Avatar>

                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {signer.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {signer.correo || "Correo no registrado"}
                            {signer.afiliacion ? ` · ${signer.afiliacion}` : ""}
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        label={signer.esPrincipal ? "Autor principal" : `Coautor #${index + 1}`}
                        size="small"
                        color={signer.esPrincipal ? "primary" : "default"}
                        variant={signer.esPrincipal ? "filled" : "outlined"}
                        sx={{ fontWeight: 600 }}
                      />
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>

            {pdfError && <Alert severity="error">{pdfError}</Alert>}
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          bgcolor: "#f8fafc",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {initialSignedUrl
            ? "El enlace del PDF se firma temporalmente por seguridad."
            : "Documento PDF aún no adjunto a esta postulación."}
        </Typography>

        <Stack direction="row" spacing={1.5}>
          <Button onClick={onClose} color="inherit" sx={{ textTransform: "none" }}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={
              openingPdf ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PictureAsPdfIcon />
              )
            }
            endIcon={!openingPdf && <OpenInNewIcon fontSize="small" />}
            onClick={handleOpenSignedPdf}
            disabled={loading || openingPdf || !initialSignedUrl}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
          >
            {openingPdf ? "Generando enlace..." : "Abrir PDF"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}