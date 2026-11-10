import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useWatch } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { recoverySchema } from "../validations/recoverySchema";

const initialValues = {
  correo: "",
  pin: "",
  clave: "",
  confirmarClave: "",
};

export default function CheckPassword() {
  const [aviso, setAviso] = useState("");
  const referencias = useRef([]);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recoverySchema),
    defaultValues: initialValues,
    mode: "onTouched",
  });

  const pin = useWatch({ control, name: "pin" }) || "";

  const actualizarDigito = (valor, indice) => {
    const digito = valor.replace(/\D/g, "").slice(-1);
    const nuevosDigitos = pin.split("");
    nuevosDigitos[indice] = digito;
    const nuevoPin = Array.from({ length: 6 }, (_, posicion) => nuevosDigitos[posicion] || "").join("");

    setValue("pin", nuevoPin, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    setAviso("");

    if (digito && indice < 5) referencias.current[indice + 1]?.focus();
  };

  const pegarPin = (evento, indice) => {
    evento.preventDefault();
    const digitos = evento.clipboardData.getData("text").replace(/\D/g, "");
    if (!digitos) return;

    const actuales = pin.split("");
    [...digitos].slice(0, 6 - indice).forEach((digito, desplazamiento) => {
      actuales[indice + desplazamiento] = digito;
    });
    const nuevoPin = Array.from({ length: 6 }, (_, posicion) => actuales[posicion] || "").join("");
    setValue("pin", nuevoPin, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    referencias.current[Math.min(indice + digitos.length, 5)]?.focus();
    setAviso("");
  };

  const manejarTeclasPin = (evento, indice) => {
    if (evento.key === "Backspace" && !pin[indice] && indice > 0) {
      referencias.current[indice - 1]?.focus();
    }
    if (evento.key === "ArrowLeft" && indice > 0) referencias.current[indice - 1]?.focus();
    if (evento.key === "ArrowRight" && indice < 5) referencias.current[indice + 1]?.focus();
  };

  const enviarFormulario = () => {
    setAviso(
      "Los datos cumplen las validaciones del formulario. Falta conectarlo al servidor para verificar el PIN y guardar la nueva contraseña.",
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2, py: 5, bgcolor: "#f2f5fa" }}>
      <Container maxWidth="sm">
        <Card elevation={1} sx={{ border: "1px solid #d8e1ef", borderRadius: 3, p: { xs: 1, sm: 3 }, bgcolor: "#fff" }}>
          <CardContent>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: "#1d3150" }}>
              Restablecer contraseña
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Ingresa el correo donde recibiste el PIN y define una nueva contraseña.
            </Typography>

            <Box component="form" onSubmit={handleSubmit(enviarFormulario)} noValidate>
              <Stack spacing={2.5}>
                <Controller
                  name="correo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Correo electrónico"
                      type="email"
                      autoComplete="email"
                      fullWidth
                      error={!!errors.correo}
                      helperText={errors.correo?.message}
                    />
                  )}
                />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: "#1d3150" }}>
                    PIN de recuperación
                  </Typography>
                  <Box sx={{ display: "flex", gap: { xs: 0.75, sm: 1.25 }, justifyContent: "space-between" }}>
                    {Array.from({ length: 6 }, (_, indice) => (
                      <TextField
                        key={indice}
                        inputRef={(elemento) => { referencias.current[indice] = elemento; }}
                        value={pin[indice] || ""}
                        onChange={(evento) => actualizarDigito(evento.target.value, indice)}
                        onPaste={(evento) => pegarPin(evento, indice)}
                        onKeyDown={(evento) => manejarTeclasPin(evento, indice)}
                        error={!!errors.pin}
                        inputProps={{
                          inputMode: "numeric",
                          autoComplete: indice === 0 ? "one-time-code" : "off",
                          maxLength: 1,
                          "aria-label": `Dígito ${indice + 1} del PIN`,
                          style: { textAlign: "center", fontSize: "1.25rem" },
                        }}
                        sx={{ width: { xs: 44, sm: 54 }, "& input": { p: { xs: 1.25, sm: 1.5 } } }}
                      />
                    ))}
                  </Box>
                  {errors.pin && (
                    <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.75 }}>
                      {errors.pin.message}
                    </Typography>
                  )}
                </Box>

                <Controller
                  name="clave"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nueva contraseña"
                      type="password"
                      autoComplete="new-password"
                      fullWidth
                      error={!!errors.clave}
                      helperText={errors.clave?.message || "Mínimo 8 caracteres, una mayúscula y un carácter especial."}
                    />
                  )}
                />

                <Controller
                  name="confirmarClave"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Confirmar nueva contraseña"
                      type="password"
                      autoComplete="new-password"
                      fullWidth
                      error={!!errors.confirmarClave}
                      helperText={errors.confirmarClave?.message}
                    />
                  )}
                />

                {aviso && <Alert severity="info">{aviso}</Alert>}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ alignSelf: { xs: "stretch", sm: "flex-end" }, textTransform: "none", borderRadius: 2, px: 4, bgcolor: "#2859d8" }}
                >
                  Restablecer contraseña
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
