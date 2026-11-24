import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { articleDisableSchema } from "../validations/articleDisableSchema";

/** Confirmation dialog for the irreversible article-disable request. */
export default function ArticleDisableDialog({ open, article, onClose, onConfirm, loading = false }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(articleDisableSchema),
    defaultValues: { motivo: "" },
    mode: "onTouched",
  });

  useEffect(() => {
    if (open) reset({ motivo: "" });
  }, [open, reset]);

  const close = () => {
    if (!loading) onClose();
  };

  const submit = async ({ motivo }) => {
    await onConfirm(motivo.trim());
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm" aria-labelledby="disable-article-title">
      <DialogTitle id="disable-article-title">Deshabilitar artículo</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {article ? <>Vas a deshabilitar <strong>{article.titulo}</strong>.</> : "Vas a deshabilitar este artículo."} Esta acción es irreversible y retirará el envío de las acciones de gestión.
        </DialogContentText>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Escribe el motivo de la deshabilitación. Se registrará en el historial del artículo.
        </Alert>
        <TextField
          {...register("motivo")}
          autoFocus
          required
          multiline
          minRows={4}
          fullWidth
          label="Motivo u observación"
          placeholder="Explica la norma o el alcance que incumple el envío..."
          error={Boolean(errors.motivo)}
          helperText={errors.motivo?.message || "Mínimo 10 caracteres."}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={close} disabled={loading} sx={{ textTransform: "none" }}>Cancelar</Button>
        <Button
          color="error"
          variant="contained"
          disabled={loading}
          onClick={handleSubmit(submit)}
          sx={{ textTransform: "none" }}
        >
          {loading ? "Deshabilitando…" : "Confirmar deshabilitación"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
