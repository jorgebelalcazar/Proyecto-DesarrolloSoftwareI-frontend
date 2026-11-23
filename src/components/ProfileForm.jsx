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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { profileSchema } from "../validations/profileSchema";
import { getMyProfile } from "../services/profileService";

export default function ProfileForm() {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [readonlyMeta, setReadonlyMeta] = useState({
    roles: [],
    especialidades: [],
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      nombres: "",
      apellidos: "",
      correo: "",
      afiliacion: "",
      pais: "",
    },
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      setLoadingProfile(true);
      setLoadError("");
      try {
        const data = await getMyProfile();
        if (!isMounted) return;

        reset({
          nombres: data.nombres || "",
          apellidos: data.apellidos || "",
          correo: data.correo || data.email || "",
          afiliacion: data.afiliacion || "",
          pais: data.pais || "",
        });

        setReadonlyMeta({
          roles: Array.isArray(data.roles) ? data.roles : [],
          especialidades: Array.isArray(data.especialidades) ? data.especialidades : [],
        });
      } catch (err) {
        if (!isMounted) return;
        setLoadError(
          err.response?.data?.detail ||
            "No se pudieron cargar los datos de tu perfil."
        );
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    }

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [reset]);

  // En HU-10.4 conectaremos aquí el PATCH y los Snackbars
  const onSubmit = (formData) => {
    console.log("Datos listos para PATCH (HU-10.4):", formData);
  };

  if (loadingProfile) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Cargando información del perfil...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card elevation={1} sx={{ borderRadius: 3, p: { xs: 2, md: 4 } }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
            Mi Perfil y Afiliación
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Consulta y actualiza tu información personal y académica.
          </Typography>

          {loadError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {loadError}
            </Alert>
          )}

          {/* Información de solo lectura (Roles y Líneas Temáticas asignadas) */}
          {(readonlyMeta.roles.length > 0 || readonlyMeta.especialidades.length > 0) && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: "#f8fafc",
                borderRadius: 2,
                border: "1px solid #e2e8f0",
              }}
            >
              {readonlyMeta.roles.length > 0 && (
                <Box sx={{ mb: readonlyMeta.especialidades.length > 0 ? 1.5 : 0 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" gutterBottom>
                    Roles asignados (solo lectura)
                  </Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {readonlyMeta.roles.map((rol, idx) => {
                      const label = typeof rol === "string" ? rol : rol?.nombre || "";
                      return <Chip key={idx} label={label} size="small" color="primary" variant="outlined" />;
                    })}
                  </Stack>
                </Box>
              )}

              {readonlyMeta.especialidades.length > 0 && (
                <Box>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" gutterBottom>
                    Líneas temáticas vinculadas
                  </Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {readonlyMeta.especialidades.map((esp, idx) => {
                      const label = typeof esp === "string" ? esp : esp?.nombre || "";
                      return <Chip key={idx} label={label} size="small" color="info" variant="outlined" />;
                    })}
                  </Stack>
                </Box>
              )}
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2.5}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                1. Datos Personales
              </Typography>

              <Controller
                name="nombres"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
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
                    fullWidth
                    required
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
                    fullWidth
                    required
                    type="email"
                    label="Correo Electrónico"
                    error={!!errors.correo}
                    helperText={errors.correo?.message}
                  />
                )}
              />

              <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ pt: 1 }}>
                2. Datos de Afiliación
              </Typography>

              <Controller
                name="afiliacion"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="Institución / Universidad"
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
                    fullWidth
                    required
                    label="País"
                    error={!!errors.pais}
                    helperText={errors.pais?.message}
                  />
                )}
              />

              <Box sx={{ pt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!isValid || !isDirty}
                  sx={{
                    textTransform: "none",
                    px: 4,
                    borderRadius: 2,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Guardar Cambios
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}