import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PdfDropzoneField from "./PdfDropzoneField";
import {
  reemplazoPdfInicialSchema,
  validateReplacementPdfFile,
} from "../validations/articleSchema";
import {
  getActiveCallConfig,
  uploadArticlePdfVersion,
} from "../services/articleService";
import { useModificationWindow } from "../hooks/useModificationWindow";

export default function ReplaceInitialPdfDialog({
  article,
  open,
  onClose,
  onSuccess,
}) {
  const [callConfig, setCallConfig] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [serverError, setServerError] = useState("");
  const { isLocked, reason } = useModificationWindow(article, callConfig);
  const deadlineUnavailable = !article?.limite_postulacion && !callConfig?.limite_postulacion;
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reemplazoPdfInicialSchema),
    mode: "onChange",
    defaultValues: { archivo: null },
  });
  const file = watch("archivo");

  useEffect(() => {
    if (!open) return;
    let active = true;
    setCallConfig(null);
    getActiveCallConfig().then((config) => {
      if (active) setCallConfig(config);
    });
    return () => {
      active = false;
    };
  }, [open]);

  const close = () => {
    reset({ archivo: null });
    setServerError("");
    setUploadProgress(null);
    onClose();
  };

  const submit = async ({ archivo }) => {
    setServerError("");
    setUploadProgress(0);
    try {
      const version = await uploadArticlePdfVersion(
        article.id,
        archivo,
        setUploadProgress
      );
      onSuccess?.(version);
      close();
    } catch (error) {
      setServerError(
        error.response?.data?.archivo?.[0] ||
        error.response?.data?.detail ||
        "No se pudo reemplazar el PDF. Intenta nuevamente."
      );
    } finally {
      setUploadProgress(null);
    }
  };

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : close} fullWidth maxWidth="sm">
      <DialogTitle>Reemplazar PDF inicial</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">{article?.titulo}</Typography>
          {(isLocked || deadlineUnavailable) && (
            <Alert severity="warning">
              {deadlineUnavailable
                ? "No se pudo verificar la fecha límite de postulación. Intenta nuevamente más tarde."
                : reason}
            </Alert>
          )}
          {serverError && <Alert severity="error">{serverError}</Alert>}
          <Controller
            name="archivo"
            control={control}
            render={({ field }) => (
              <PdfDropzoneField
                file={field.value}
                error={errors.archivo?.message}
                uploadProgress={uploadProgress}
                disabled={isLocked || deadlineUnavailable || isSubmitting}
                helperText="Selecciona el nuevo PDF (application/pdf, máximo 10 MB). Las versiones anteriores se conservarán."
                onFileSelect={(selected) => {
                  const error = validateReplacementPdfFile(selected);
                  if (error) setValue("archivo", selected, { shouldValidate: true });
                  else field.onChange(selected);
                }}
                onFileRemove={() => field.onChange(null)}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={close} disabled={isSubmitting}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit(submit)}
          disabled={isLocked || deadlineUnavailable || isSubmitting || !file || Boolean(errors.archivo)}
        >
          {isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Subir nueva versión"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
