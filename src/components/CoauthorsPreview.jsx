import { Container, Paper } from "@mui/material";
import CoauthorsForm from "./CoauthorsForm";

const initialCoauthors = [
  {
    nombreCompleto: "Ana Torres",
    afiliacion: "Universidad Nacional de Colombia",
    correo: "ana.torres@universidad.edu.co",
  },
];

export default function CoauthorsPreview() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 6 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
        <CoauthorsForm initialCoauthors={initialCoauthors} />
      </Paper>
    </Container>
  );
}
