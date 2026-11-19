import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { registerSchema } from "../validations/registerSchema";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      nombreCompleto: "",
      email: "",
      institucion: "",
      pais: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data) => {
    const { confirmPassword: _, ...payload } = data;
    console.log("Formulario válido listo para enviar al backend:", payload);
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
                    label="Nombre completo"
                    error={!!errors.nombreCompleto}
                    helperText={errors.nombreCompleto?.message}
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

              <Box sx={{ pt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!isValid}
                  sx={{
                    textTransform: "none",
                    px: 4,
                    borderRadius: 2,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Registrarse
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}