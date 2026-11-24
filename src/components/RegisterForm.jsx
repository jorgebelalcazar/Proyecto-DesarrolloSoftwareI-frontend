import React, { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { registerSchema } from "../validations/registerSchema";

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";
const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_ROOT = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;

export default function RegisterForm() {
  const recaptchaRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      nombreCompleto: "",
      apellidos: "",
      email: "",
      institucion: "",
      pais: "",
      password: "",
      confirmPassword: "",
      aceptaTratamientoDatos: false,
    },
  });

  const handleRecaptchaChange = (token) => {
    setValue("recaptchaToken", token || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setFeedback(null);

    const payload = {
      correo: data.email.trim(),
      nombres: data.nombreCompleto.trim(),
      apellidos: data.apellidos.trim(),
      afiliacion: data.institucion.trim(),
      pais: data.pais.trim(),
      clave: data.password,
      confirmacion_clave: data.confirmPassword,
      acepta_tratamiento_datos: data.aceptaTratamientoDatos,
    };

    try {
      const response = await axios.post(`${API_ROOT}/usuarios/registro-autor/`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      setFeedback({
        type: "success",
        message: response.data?.message || "Registro completado con éxito.",
      });
      reset();
      recaptchaRef.current?.reset();
    } catch (error) {
      const responseErrors = error.response?.data;
      const backendMsg = responseErrors?.detail || responseErrors?.message ||
        Object.values(responseErrors || {}).flat().join(" ") ||
        "No se pudo completar el registro. Verifica tus datos o intenta más tarde.";

      setFeedback({
        type: "error",
        message: backendMsg,
      });
      recaptchaRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card elevation={1} sx={{ borderRadius: 3, p: { xs: 2, md: 4 } }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
            Registro de Autor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Crea tu cuenta para postular artículos a la conferencia.
          </Typography>

          {feedback && (
            <Alert severity={feedback.type} sx={{ mb: 3 }}>
              {feedback.message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                1. Datos del Perfil
              </Typography>

              <Controller
                name="nombreCompleto"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="Nombres"
                    error={!!errors.nombreCompleto}
                    helperText={errors.nombreCompleto?.message}
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
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    type="email"
                    label="Correo electrónico"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />

              <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ pt: 1 }}>
                2. Afiliación y Ubicación
              </Typography>

              <Controller
                name="institucion"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="Afiliación institucional"
                    error={!!errors.institucion}
                    helperText={errors.institucion?.message}
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

              <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ pt: 1 }}>
                3. Seguridad de la Cuenta
              </Typography>

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    type={showPassword ? "text" : "password"}
                    label="Contraseña (mínimo 8 caracteres)"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                            aria-label="mostrar o ocultar contraseña"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirmar contraseña"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            edge="end"
                            aria-label="mostrar o ocultar confirmación de contraseña"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Box sx={{ pt: 1 }}>
                {SITE_KEY ? (
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={SITE_KEY}
                    onChange={handleRecaptchaChange}
                    onExpired={() => handleRecaptchaChange("")}
                  />
                ) : (
                  <Alert severity="warning">
                    Falta configurar <strong>VITE_RECAPTCHA_SITE_KEY</strong> en tu archivo <code>.env</code>.
                  </Alert>
                )}
              </Box>

              <Controller
                name="aceptaTratamientoDatos"
                control={control}
                render={({ field }) => (
                  <Box>
                    <FormControlLabel
                      control={<Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />}
                      label="Acepto el tratamiento de mis datos personales"
                    />
                    {errors.aceptaTratamientoDatos && (
                      <Typography variant="caption" color="error" display="block">
                        {errors.aceptaTratamientoDatos.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />

              <Box sx={{ pt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!isValid || submitting}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
                  sx={{
                    textTransform: "none",
                    px: 4,
                    borderRadius: 2,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  {submitting ? "Enviando..." : "Registrarse"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
