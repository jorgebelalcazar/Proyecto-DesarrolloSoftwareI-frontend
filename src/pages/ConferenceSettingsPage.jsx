import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Alert, Box, Button, CircularProgress, Container, Paper, Stack, TextField, Typography,
} from "@mui/material";
import { apiClient, getErrorMessage } from "../services/authService.js";

const camposFecha = [
  ["limite_postulacion", "Límite de postulación", "datetime-local"],
  ["limite_revision", "Límite de revisión", "datetime-local"],
  ["limite_correccion", "Límite de corrección", "datetime-local"],
  ["limite_version_final", "Límite de versión final", "datetime-local"],
  ["fecha_inicio_evento", "Inicio del evento", "date"],
  ["fecha_fin_evento", "Fin del evento", "date"],
];

const esquema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  ...Object.fromEntries(camposFecha.map(([campo, etiqueta]) => [
    campo, z.string().min(1, `${etiqueta} es obligatoria`),
  ])),
}).superRefine((valores, contexto) => {
  for (let indice = 1; indice < 4; indice += 1) {
    const [actual] = camposFecha[indice];
    const [anterior, etiquetaAnterior] = camposFecha[indice - 1];
    if (valores[actual] <= valores[anterior]) {
      contexto.addIssue({ code: "custom", path: [actual], message: `Debe ser posterior a ${etiquetaAnterior.toLowerCase()}.` });
    }
  }
  if (valores.fecha_inicio_evento <= valores.limite_version_final.slice(0, 10)) {
    contexto.addIssue({ code: "custom", path: ["fecha_inicio_evento"], message: "El evento debe comenzar después del límite de versión final." });
  }
  if (valores.fecha_fin_evento < valores.fecha_inicio_evento) {
    contexto.addIssue({ code: "custom", path: ["fecha_fin_evento"], message: "Debe ser igual o posterior al inicio del evento." });
  }
});

function valorLocal(campo, valor) {
  if (!valor) return "";
  if (campo.startsWith("fecha_")) return String(valor).slice(0, 10);
  return dayjs(valor).format("YYYY-MM-DDTHH:mm");
}

export default function ConferenceSettingsPage() {
  const [conferenceId, setConferenceId] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: { nombre: "", ...Object.fromEntries(camposFecha.map(([campo]) => [campo, ""])) },
  });

  useEffect(() => {
    apiClient.get("/api/conferencias/vigente/")
      .then(({ data }) => {
        setConferenceId(data.id);
        reset({ nombre: data.nombre, ...Object.fromEntries(camposFecha.map(([campo]) => [campo, valorLocal(campo, data[campo])])) });
      })
      .catch((error) => {
        if (error.response?.status !== 404) setMensaje({ tipo: "error", texto: getErrorMessage(error) });
      });
  }, [reset]);

  const guardar = async (valores) => {
    setMensaje(null);
    const datos = { ...valores };
    camposFecha.filter(([campo]) => campo.startsWith("limite_")).forEach(([campo]) => {
      datos[campo] = `${valores[campo]}:00-05:00`;
    });
    try {
      const respuesta = conferenceId
        ? await apiClient.put(`/api/conferencias/${conferenceId}/`, datos)
        : await apiClient.post("/api/conferencias/", datos);
      setConferenceId(respuesta.data.id);
      setMensaje({ tipo: "success", texto: "El calendario de la conferencia quedó guardado." });
    } catch (error) {
      const errores = error.response?.data;
      setMensaje({ tipo: "error", texto: typeof errores === "object" ? Object.values(errores).flat().join(" ") : getErrorMessage(error) });
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper component="section" sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="primary">HU-13 · Configuración</Typography>
            <Typography variant="h4" component="h1" fontWeight={700}>Calendario de la conferencia</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Configura los plazos en hora de Colombia y las fechas del evento.</Typography>
          </Box>
          {mensaje && <Alert severity={mensaje.tipo}>{mensaje.texto}</Alert>}
          <Box component="form" onSubmit={handleSubmit(guardar)} noValidate>
            <Stack spacing={2}>
              <TextField label="Nombre de la conferencia" required {...register("nombre")} error={Boolean(errors.nombre)} helperText={errors.nombre?.message} />
              {camposFecha.map(([campo, etiqueta, tipo]) => (
                <TextField key={campo} label={etiqueta} type={tipo} required {...register(campo)} error={Boolean(errors[campo])} helperText={errors[campo]?.message || (tipo === "datetime-local" ? "Zona horaria: America/Bogota" : "")} slotProps={{ inputLabel: { shrink: true }, htmlInput: tipo === "datetime-local" ? {step: 60} : undefined, }} />
              ))}
              <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={22} color="inherit" /> : "Guardar calendario"}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
