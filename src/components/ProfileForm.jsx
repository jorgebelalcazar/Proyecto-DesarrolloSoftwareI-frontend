import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Stack, 
  TextField, 
  Typography, 
  MenuItem 
} from "@mui/material";
import { profileSchema } from "../validations/profileSchema";

export default function ProfileForm() {
  const { 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nombreCompleto: "",
      email: "",
      telefono: "",
      institucion: "",
      facultad: "",
      pais: "",
      lineaTematica: "",
    }
  });

  const onSubmit = (data) => {
    console.log("Datos del perfil y afiliación enviados:", data);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card elevation={1} sx={{ borderRadius: 3, p: { xs: 2, md: 4 } }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
            Editar Perfil y Afiliación
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Actualiza tu información personal y los datos de tu institución académica.
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={3}>
              
              {/* 1. Datos Personales */}
              <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 1 }}>
                1. Datos Personales
              </Typography>

              <Controller
                name="nombreCompleto"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nombre Completo"
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
                    label="Correo Electrónico"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />

              <Controller
                name="telefono"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Teléfono / Celular"
                    error={!!errors.telefono}
                    helperText={errors.telefono?.message}
                  />
                )}
              />

              {/* 2. Datos de Afiliación (ubicado exactamente debajo del teléfono) */}
              <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ mt: 2 }}>
                2. Datos de Afiliación
              </Typography>

              <Controller
                name="institucion"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Institución / Universidad"
                    error={!!errors.institucion}
                    helperText={errors.institucion?.message}
                  />
                )}
              />

              <Controller
                name="facultad"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Facultad / Departamento"
                    error={!!errors.facultad}
                    helperText={errors.facultad?.message}
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
                    label="País"
                    error={!!errors.pais}
                    helperText={errors.pais?.message}
                  />
                )}
              />

              <Controller
                name="lineaTematica"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Línea Temática Principal"
                    error={!!errors.lineaTematica}
                    helperText={errors.lineaTematica?.message}
                  >
                    <MenuItem value="Sistemas Inteligentes">Sistemas Inteligentes</MenuItem>
                    <MenuItem value="Tecnologías en Informática">Tecnologías en Informática</MenuItem>
                    <MenuItem value="Educación en Informática">Educación en Informática</MenuItem>
                    <MenuItem value="Sistemas de Software">Sistemas de Software</MenuItem>
                    <MenuItem value="Software en la práctica">Software en la práctica</MenuItem>
                  </TextField>
                )}
              />

              {/* Botón de envío */}
              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  sx={{ textTransform: "none", px: 4, borderRadius: 2, width: { xs: "100%", sm: "auto" } }}
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