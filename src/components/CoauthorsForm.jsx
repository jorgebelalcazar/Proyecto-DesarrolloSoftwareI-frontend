import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { coauthorsSchema } from "../validations/coauthorsSchema";

const emptyCoauthor = { nombreCompleto: "", afiliacion: "", correo: "" };

/**
 * Reusable editor for non-registered coauthors. Persistence is delegated to
 * the parent because the article endpoint is owned by the backend.
 */
export default function CoauthorsForm({ initialCoauthors = [], onSave }) {
  const [saved, setSaved] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(coauthorsSchema),
    defaultValues: {
      coautores: initialCoauthors.length > 0 ? initialCoauthors : [emptyCoauthor],
    },
    mode: "onTouched",
  });
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "coautores",
  });
  const coauthorsError = errors.coautores?.root?.message || errors.coautores?.message;

  const submit = async (data) => {
    setSaved(false);
    await onSave?.(data.coautores);
    setSaved(true);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#1d3150">
            Coautores y firmantes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Agrega a cada investigador con sus datos de contacto. No necesitan tener una cuenta en el sistema.
          </Typography>
        </Box>

        {coauthorsError && (
          <Alert severity="error">{coauthorsError}</Alert>
        )}

        {fields.map((field, index) => {
          const fieldErrors = errors.coautores?.[index];
          return (
            <Card key={field.id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Typography fontWeight={700} color="#1d3150">
                      Firmante {index + 1}
                    </Typography>
                    <Stack direction="row" spacing={0.25}>
                      <IconButton
                        size="small"
                        aria-label={`Subir al firmante ${index + 1}`}
                        disabled={index === 0}
                        onClick={() => move(index, index - 1)}
                      >
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label={`Bajar al firmante ${index + 1}`}
                        disabled={index === fields.length - 1}
                        onClick={() => move(index, index + 1)}
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={`Eliminar al firmante ${index + 1}`}
                        onClick={() => remove(index)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                  <Divider />
                  <TextField
                    {...register(`coautores.${index}.nombreCompleto`)}
                    label="Nombre completo"
                    required
                    fullWidth
                    error={Boolean(fieldErrors?.nombreCompleto)}
                    helperText={fieldErrors?.nombreCompleto?.message}
                  />
                  <TextField
                    {...register(`coautores.${index}.afiliacion`)}
                    label="Afiliación institucional"
                    required
                    fullWidth
                    error={Boolean(fieldErrors?.afiliacion)}
                    helperText={fieldErrors?.afiliacion?.message}
                  />
                  <TextField
                    {...register(`coautores.${index}.correo`)}
                    label="Correo electrónico"
                    type="email"
                    autoComplete="email"
                    required
                    fullWidth
                    error={Boolean(fieldErrors?.correo)}
                    helperText={fieldErrors?.correo?.message}
                  />
                </Stack>
              </CardContent>
            </Card>
          );
        })}

        <Button
          type="button"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => append(emptyCoauthor)}
          sx={{ alignSelf: "flex-start", textTransform: "none" }}
        >
          Agregar firmante
        </Button>

        {saved && (
          <Alert severity="success">
            Los datos cumplen las validaciones locales y están listos para enviarse con el artículo.
          </Alert>
        )}

        <Button type="submit" variant="contained" size="large" sx={{ alignSelf: { xs: "stretch", sm: "flex-end" }, textTransform: "none" }}>
          Guardar coautores
        </Button>
      </Stack>
    </Box>
  );
}
