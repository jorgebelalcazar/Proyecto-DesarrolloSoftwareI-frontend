import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PdfDropzoneField({
  file,
  error = "",
  uploadProgress = null,
  onFileSelect,
  onFileRemove,
  disabled = false,
  helperText = "Arrastra tu manuscrito en formato PDF o haz clic para seleccionarlo (máx. 10 MB).",
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleOpenPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleInputChange = (event) => {
    const selected = event.target.files?.[0];
    if (selected) {
      onFileSelect?.(selected);
    }
    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileSelect?.(droppedFile);
    }
  };

  const isUploading = typeof uploadProgress === "number";

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
        Documento del artículo (PDF) *
      </Typography>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        hidden
        onChange={handleInputChange}
        disabled={disabled}
      />

      {!file ? (
        <Paper
          variant="outlined"
          onClick={handleOpenPicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            p: 3,
            textAlign: "center",
            borderRadius: 2.5,
            borderStyle: "dashed",
            borderWidth: 2,
            borderColor: error
              ? "#dc2626"
              : isDragging
              ? "#2859d8"
              : "#cbd5e1",
            bgcolor: isDragging ? "rgba(40, 89, 216, 0.04)" : "#f8fafc",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: disabled
                ? "#cbd5e1"
                : error
                ? "#dc2626"
                : "#2859d8",
              bgcolor: disabled ? "#f8fafc" : "rgba(40, 89, 216, 0.03)",
            },
          }}
        >
          <Stack spacing={1} alignItems="center">
            <CloudUploadIcon
              sx={{
                fontSize: 40,
                color: error ? "#dc2626" : isDragging ? "#2859d8" : "#64748b",
              }}
            />
            <Typography variant="body1" fontWeight={600} color="text.primary">
              Arrastra y suelta tu archivo PDF aquí
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {helperText}
            </Typography>
            <Button
              type="button"
              variant="outlined"
              size="small"
              disabled={disabled}
              sx={{ mt: 1, textTransform: "none", borderRadius: 2 }}
            >
              Seleccionar archivo PDF
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2.5,
            borderColor: error ? "#fca5a5" : "#93c5fd",
            bgcolor: error ? "#fef2f2" : "#eff6ff",
          }}
        >
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ minWidth: 0 }}
              >
                <PictureAsPdfIcon
                  sx={{ fontSize: 36, color: "#dc2626", flexShrink: 0 }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    noWrap
                    title={file.name}
                  >
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(file.size)} · Documento PDF validado
                  </Typography>
                </Box>
              </Stack>

              <IconButton
                aria-label="Eliminar archivo PDF"
                color="error"
                size="small"
                disabled={disabled}
                onClick={() => onFileRemove?.()}
              >
                <CloseIcon />
              </IconButton>
            </Stack>

            {isUploading && (
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mb: 0.5 }}
                >
                  <Typography variant="caption" fontWeight={600} color="primary">
                    Subiendo manuscrito a Supabase Storage...
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="primary">
                    {uploadProgress}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ height: 7, borderRadius: 4 }}
                />
              </Box>
            )}
          </Stack>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}