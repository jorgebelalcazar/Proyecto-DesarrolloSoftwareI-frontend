import { useState } from "react";
import { Alert, Button, Container, Paper, Stack, Typography } from "@mui/material";
import CreateUserDialog from "./CreateUserDialog";

const rolesDeEjemplo = ["Administrador", "Autor", "Evaluador"];
const lineasDeEjemplo = [
  "Sistemas Inteligentes",
  "Tecnologías en Informática",
  "Educación en Informática",
  "Sistemas de Software",
  "Software en la práctica",
];

/** Temporary host to preview SCRUM-82/83 until the admin users page is available. */
export default function CreateUserDialogPreview() {
  const [abierto, setAbierto] = useState(false);
  const [aviso, setAviso] = useState("");

  const mostrarDatosDeVistaPrevia = (datos) => {
    console.info("Datos del formulario de vista previa (no enviados al servidor):", datos);
    setAviso("Formulario completado en la vista previa; aún no se guardó en el servidor.");
    setAbierto(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
        <Stack spacing={2} alignItems="flex-start">
          <Typography variant="h4" fontWeight={700} color="#1d3150">
            Administración de usuarios
          </Typography>
          <Typography color="text.secondary">
            Vista previa del modal de alta y de los selectores múltiples de Roles y Líneas.
          </Typography>
          <Button variant="contained" onClick={() => { setAviso(""); setAbierto(true); }}>
            Agregar usuario
          </Button>
          {aviso && <Alert severity="info">{aviso}</Alert>}
        </Stack>
      </Paper>

      <CreateUserDialog
        open={abierto}
        onClose={() => setAbierto(false)}
        onCreateUser={mostrarDatosDeVistaPrevia}
        rolesDisponibles={rolesDeEjemplo}
        lineasDisponibles={lineasDeEjemplo}
      />
    </Container>
  );
}
