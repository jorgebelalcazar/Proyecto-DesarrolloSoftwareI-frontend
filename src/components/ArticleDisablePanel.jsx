import { useState } from "react";
import BlockIcon from "@mui/icons-material/Block";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArticleDisableDialog from "./ArticleDisableDialog";

/** Article detail actions for a scientific committee member. */
export default function ArticleDisablePanel({ article, onDisable }) {
  const [currentArticle, setCurrentArticle] = useState(article);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const disableArticle = async (motivo) => {
    setLoading(true);
    setError("");
    try {
      await onDisable(currentArticle.id, motivo);
      setCurrentArticle((current) => ({
        ...current,
        estado: "DESHABILITADO",
        motivoDeshabilitacion: motivo,
      }));
      setDialogOpen(false);
    } catch {
      setError("No fue posible deshabilitar el artículo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const disabled = currentArticle.estado === "DESHABILITADO";

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Stack spacing={2.25}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="overline" color="text.secondary">Artículo #{currentArticle.id}</Typography>
            <Typography variant="h5" fontWeight={700} color="#1d3150">{currentArticle.titulo}</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>{currentArticle.autor}</Typography>
          </Box>
          <Chip
            label={currentArticle.estado}
            color={disabled ? "error" : "primary"}
            sx={disabled ? { fontWeight: 700 } : undefined}
          />
        </Box>
        <Divider />

        {disabled ? (
          <Alert severity="error">
            Este artículo está deshabilitado. Sus acciones de edición y gestión están bloqueadas.
            <Box component="span" sx={{ display: "block", mt: 0.75 }}>
              <strong>Motivo registrado:</strong> {currentArticle.motivoDeshabilitacion}
            </Box>
          </Alert>
        ) : (
          <Alert severity="info">El artículo está activo y puede continuar en el flujo editorial.</Alert>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          {!disabled && (
            <Button variant="outlined" startIcon={<EditOutlinedIcon />} sx={{ textTransform: "none" }}>
              Gestionar artículo
            </Button>
          )}
          {!disabled && (
            <Button
              color="error"
              variant="contained"
              startIcon={<BlockIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{ textTransform: "none" }}
            >
              Deshabilitar artículo
            </Button>
          )}
        </Stack>
      </Stack>

      <ArticleDisableDialog
        open={dialogOpen}
        article={currentArticle}
        loading={loading}
        onClose={() => setDialogOpen(false)}
        onConfirm={disableArticle}
      />
    </Paper>
  );
}
