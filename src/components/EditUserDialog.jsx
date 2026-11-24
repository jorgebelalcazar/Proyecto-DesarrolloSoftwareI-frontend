import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MultiSelectChips from "./MultiSelectChips";
import { editUserSchema } from "../validations/editUserSchema";
import { getThematicLines, updateUserByAdmin } from "../services/userAdminService";
import { useAuth } from "../context/AuthContext.jsx";

const ROLE_OPTIONS = [
  { code: "ADMIN", label: "Administrador" },
  { code: "COMITE", label: "Miembro del comité científico" },
  { code: "AUTOR", label: "Autor" },
];

const CODE_TO_LABEL = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.code, r.label]));
const LABEL_TO_CODE = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.label, r.code]));

function extractRoleCodes(rawRoles = []) {
  if (!Array.isArray(rawRoles)) return [];
  return rawRoles
    .map((rol) => {
      const val = typeof rol === "string" ? rol : rol?.codigo || rol?.nombre || "";
      const upper = val.trim().toUpperCase();
      if (CODE_TO_LABEL[upper]) return upper;
      return LABEL_TO_CODE[val.trim()] || null;
    })
    .filter(Boolean);
}

function extractSpecialtyNames(rawEspecialidades = []) {
  if (!Array.isArray(rawEspecialidades)) return [];
  return rawEspecialidades
    .map((esp) => (typeof esp === "string" ? esp : esp?.nombre || ""))
    .filter(Boolean);
}

export default function EditUserDialog({ open, user, onClose, onSaved }) {
  const { activeRole } = useAuth();
  const [lineasCatalog, setLineasCatalog] = useState([]);
  const [loadingLineas, setLoadingLineas] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const availableRoleLabels = useMemo(() => {
    const allowedCodes =
      activeRole === "COMITE" ? ["COMITE", "AUTOR"] : ["ADMIN", "COMITE", "AUTOR"];
    return allowedCodes.map((code) => CODE_TO_LABEL[code]);
  }, [activeRole]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(editUserSchema),
    mode: "onChange",
    defaultValues: {
      nombres: "",
      apellidos: "",
      correo: "",
      afiliacion: "",
      pais: "",
      roles: [],
      especialidades: [],
    },
  });

  // Cargar catálogo de líneas temáticas al abrir el modal
  useEffect(() => {
    if (!open) return;
    let active = true;

    async function loadLineas() {
      setLoadingLineas(true);
      try {
        const items = await getThematicLines();
        if (active) setLineasCatalog(items);
      } catch {
        // Si falla el catálogo, se mantienen al menos las líneas actuales del usuario
      } finally {
        if (active) setLoadingLineas(false);
      }
    }

    loadLineas();
    return () => {
      active = false;
    };
  }, [open]);

  // Precargar los datos del usuario seleccionado desde la fila
  useEffect(() => {
    if (!open || !user) return;
    setServerError("");

    reset({
      nombres: user.nombres || "",
      apellidos: user.apellidos || "",
      correo: user.correo || "",
      afiliacion: user.afiliacion || "",
      pais: user.pais || "",
      roles: extractRoleCodes(user.roles),
      especialidades: extractSpecialtyNames(user.especialidades),
    });
  }, [open, user, reset]);

  const availableSpecialtyNames = useMemo(() => {
    const fromCatalog = lineasCatalog.map((l) => l.nombre).filter(Boolean);
    const fromUser = extractSpecialtyNames(user?.especialidades);
    return Array.from(new Set([...fromCatalog, ...fromUser]));
  }, [lineasCatalog, user]);

  const handleClose = () => {
    if (submitting) return;
    setServerError("");
    onClose?.();
  };

  const onSubmit = async (formData) => {
    if (!user?.id) {
      setServerError("No se encontró el identificador del usuario seleccionado.");
      return;
    }

    setSubmitting(true);
    setServerError("");

    try {
      // Mapea nombres de líneas temáticas a sus IDs si existen en catálogo
      const especialidadIds = formData.especialidades
        .map((nombre) => {
          const foundInCatalog = lineasCatalog.find((l) => l.nombre === nombre);
          if (foundInCatalog?.id !== undefined) return foundInCatalog.id;
          const foundInUser = (user.especialidades || []).find(
            (e) => typeof e === "object" && e?.nombre === nombre
          );
          return foundInUser?.id;
        })
        .filter((id) => id !== undefined);

      const payload = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        correo: formData.correo.trim(),
        afiliacion: formData.afiliacion.trim(),
        pais: formData.pais.trim(),
        roles: formData.roles,
        especialidades:
          especialidadIds.length === formData.especialidades.length
            ? especialidadIds
            : formData.especialidades,
      };

      const updatedUser = await updateUserByAdmin(user.id, payload);
      onSaved?.(updatedUser);
      onClose?.();
    } catch (err) {
      const body = err.response?.data;
      const msg =
        body?.detail ||
        body?.message ||
        (body && typeof body === "object"
          ? Object.values(body).flat().join(" ")
          : null) ||
        "No se pudieron actualizar los datos del usuario.";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="edit-user-dialog-title"
    >
      <DialogTitle id="edit-user-dialog-title" fontWeight={700}>
        Editar usuario
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ mb: 2.5 }}>
          Modifica los datos personales, afiliación, roles y líneas temáticas del miembro seleccionado.
        </DialogContentText>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {serverError}
          </Alert>
        )}

        <Stack
          component="form"
          id="edit-user-form"
          spacing={2.25}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Controller
            name="nombres"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                disabled={submitting}
                label="Nombres"
                error={!!errors.nombres}
                helperText={errors.nombres?.message}
              />
            )}
          />

          <Controller
            name="apellidos"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                disabled={submitting}
                label="Apellidos"
                error={!!errors.apellidos}
                helperText={errors.apellidos?.message}
              />
            )}
          />

          <Controller
            name="correo"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                type="email"
                disabled={submitting}
                label="Correo electrónico"
                error={!!errors.correo}
                helperText={errors.correo?.message}
              />
            )}
          />

          <Controller
            name="afiliacion"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                disabled={submitting}
                label="Afiliación institucional"
                error={!!errors.afiliacion}
                helperText={errors.afiliacion?.message}
              />
            )}
          />

          <Controller
            name="pais"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                disabled={submitting}
                label="País"
                error={!!errors.pais}
                helperText={errors.pais?.message}
              />
            )}
          />

          <Controller
            name="roles"
            control={control}
            render={({ field }) => {
              const selectedLabels = (field.value || [])
                .map((code) => CODE_TO_LABEL[code])
                .filter(Boolean);

              return (
                <Box>
                  <MultiSelectChips
                    label="Roles asignados *"
                    options={availableRoleLabels}
                    value={selectedLabels}
                    placeholder="Selecciona al menos un rol"
                    onChange={(newLabels) => {
                      const newCodes = newLabels
                        .map((lbl) => LABEL_TO_CODE[lbl])
                        .filter(Boolean);
                      field.onChange(newCodes);
                    }}
                  />
                  {errors.roles && (
                    <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5, display: "block" }}>
                      {errors.roles.message}
                    </Typography>
                  )}
                </Box>
              );
            }}
          />

          <Controller
            name="especialidades"
            control={control}
            render={({ field }) => (
              <Box>
                <MultiSelectChips
                  label="Líneas temáticas"
                  options={availableSpecialtyNames}
                  value={field.value || []}
                  placeholder={
                    loadingLineas
                      ? "Cargando líneas temáticas..."
                      : "Selecciona una o más líneas temáticas"
                  }
                  onChange={(newValues) => field.onChange(newValues)}
                />
                {errors.especialidades && (
                  <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5, display: "block" }}>
                    {errors.especialidades.message}
                  </Typography>
                )}
              </Box>
            )}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={handleClose}
          disabled={submitting}
          sx={{ textTransform: "none" }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="edit-user-form"
          variant="contained"
          disabled={!isValid || !isDirty || submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {submitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}