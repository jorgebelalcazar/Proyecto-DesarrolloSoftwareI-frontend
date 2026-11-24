import { useState } from "react";
import { Alert, Container, Paper, Stack, Typography } from "@mui/material";
import UserDeactivationTable from "./UserDeactivationTable";

const sampleUsers = [
  { id: "u-101", nombre: "María López", correo: "maria@example.edu", rol: "Administradora" },
  { id: "u-102", nombre: "Diego Suárez", correo: "diego@example.edu", rol: "Miembro del comité científico" },
  { id: "u-103", nombre: "Ana Torres", correo: "ana@example.edu", rol: "Autora" },
];

/** Temporary host until the users API is connected. */
export default function UserDeactivationPreview() {
  const [users, setUsers] = useState(sampleUsers);

  const mockDeactivate = async (userId) => {
    // Replace this preview callback with the backend DELETE service.
    console.info("Vista previa de DELETE para usuario:", userId);
  };

  const removeFromLocalState = (userId) => {
    setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={700} color="#1d3150">
            Administración de usuarios
          </Typography>
          <Alert severity="info">
            Vista previa local: al confirmar, la fila desaparece de esta pantalla; no se modifica el servidor.
          </Alert>
          <UserDeactivationTable
            users={users}
            onDeactivateUser={mockDeactivate}
            onUserDeactivated={removeFromLocalState}
            canDeactivate
          />
        </Stack>
      </Paper>
    </Container>
  );
}
