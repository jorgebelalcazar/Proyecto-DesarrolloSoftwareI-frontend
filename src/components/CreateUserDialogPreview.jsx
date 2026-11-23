import { useEffect, useState } from "react";
import axios from "axios";
import { Alert, Button, Container, Paper, Stack, Typography } from "@mui/material";
import CreateUserDialog from "./CreateUserDialog";
import { useAuth } from "../context/AuthContext.jsx";

const ROLES = ["ADMIN", "COMITE", "AUTOR"];
const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_ROOT = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;

/** Temporary host to preview SCRUM-82/83 until the admin users page is available. */
export default function CreateUserDialogPreview() {
  const [abierto, setAbierto] = useState(false);
  const [aviso, setAviso] = useState("");
  const [error, setError] = useState("");
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(false);
  const { activeRole } = useAuth();
  const rolesDisponibles = activeRole === "COMITE"
    ? ["Miembro del comité científico", "Autor"]
    : ["Administrador", "Miembro del comité científico", "Autor"];

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    axios.get(`${API_ROOT}/lineas-tematicas/`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "X-Rol-Activo": activeRole || localStorage.getItem("active_role"),
      },
    }).then(({ data }) => setLineas(data.results || data))
      .catch(() => setError("No se pudieron cargar las líneas temáticas."));
  }, [activeRole]);

  const crearUsuario = async (datos) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const roles = datos.roles.map((rol) => ({
        Administrador: "ADMIN",
        "Miembro del comité científico": "COMITE",
        Autor: "AUTOR",
      })[rol] || rol);
      const especialidades = datos.lineas
        .map((nombre) => lineas.find((linea) => linea.nombre === nombre)?.id)
        .filter((id) => id !== undefined);
      await axios.post(`${API_ROOT}/usuarios/crear/`, {
        correo: datos.correo,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        afiliacion: datos.afiliacion,
        pais: datos.pais,
        clave: datos.clave,
        roles,
        especialidades,
      }, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "X-Rol-Activo": activeRole || localStorage.getItem("active_role"),
        },
      });
      setAviso("La cuenta se creó correctamente.");
      setAbierto(false);
    } catch (err) {
      const body = err.response?.data || {};
      setError(body.detail || Object.values(body).flat().join(" ") || "No se pudo crear la cuenta.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
        <Stack spacing={2} alignItems="flex-start">
          <Typography variant="h4" fontWeight={700} color="#1d3150">
            Administración de usuarios
          </Typography>
          <Typography color="text.secondary">
          Crea cuentas y asigna roles y líneas temáticas.
          </Typography>
          <Button variant="contained" onClick={() => { setAviso(""); setAbierto(true); }}>
            Agregar usuario
          </Button>
          {aviso && <Alert severity="info">{aviso}</Alert>}
        </Stack>
      </Paper>

      <CreateUserDialog
        open={abierto}
        onClose={() => { setAbierto(false); setError(""); }}
        onCreateUser={crearUsuario}
        rolesDisponibles={rolesDisponibles}
        lineasDisponibles={lineas.map((linea) => linea.nombre)}
        loading={loading}
        error={error}
      />
    </Container>
  );
}
