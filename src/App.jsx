import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import CreateUserDialogPreview from "./components/CreateUserDialogPreview.jsx";
import RegisterForm from "./components/RegisterForm";
import LoginPage from "./components/LoginPage.jsx";
import Navbar from "./components/Navbar.jsx";
import ProfileForm from "./components/ProfileForm.jsx";
import UsersDirectoryTable from "./components/UsersDirectoryTable.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import RequestPinPage from "./pages/RequestPinPage.jsx";
import PinStepPage from "./pages/PinStepPage.jsx";
import EditUserDialog from "./components/EditUserDialog.jsx";
import SubmitArticleForm from "./components/SubmitArticleForm.jsx";
import { deactivateUserByAdmin } from "./services/userAdminService";
import MyArticlesTable from "./components/MyArticlesTable.jsx";
import "./recovery.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const MENUS_POR_ROL = {
  AUTOR: ["Mis artículos", "Enviar nueva ponencia", "Estado de evaluaciones"],
  COMITE: ["Artículos asignados", "Evaluaciones pendientes", "Asignar revisores"],
  ADMIN: ["Gestión de usuarios", "Configuración de eventos", "Reportes globales"],
};

function AuthScreen({ mostrarRegistro, setMostrarRegistro, startSession }) {
  return (
    <Box>
      {mostrarRegistro ? (
        <RegisterForm />
      ) : (
        <LoginPage onLoginSuccess={startSession} />
      )}

      <Box sx={{ textAlign: "center", py: 2, bgcolor: "#f8fafc" }}>
        <Button
          variant="text"
          onClick={() => setMostrarRegistro((prev) => !prev)}
          sx={{ textTransform: "none" }}
        >
          {mostrarRegistro
            ? "¿Ya tienes cuenta? Inicia sesión aquí"
            : "¿Eres autor nuevo? Regístrate aquí"}
        </Button>
      </Box>
    </Box>
  );
}

function AdminUsersDirectorySection() {
  const { activeRole, hasActiveRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    rol: "TODOS",
    activo: "TODOS",
  });

  const canManageUsers = hasActiveRole(["ADMIN", "COMITE"]);

  const fetchUsers = useCallback(
    async (signal) => {
      if (!canManageUsers) return;

      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("access_token");
        const params = {};

        if (filters.search.trim()) params.search = filters.search.trim();
        if (filters.rol !== "TODOS") params.rol = filters.rol;
        if (filters.activo !== "TODOS") params.estado = filters.activo;

        const { data } = await axios.get(`${API_URL}/api/usuarios/`, {
          params,
          signal,
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "X-Rol-Activo": activeRole || localStorage.getItem("active_role"),
          },
        });

        setUsers(Array.isArray(data) ? data : data?.results || []);
      } catch (err) {
        if (axios.isCancel(err) || err.name === "CanceledError") return;
        setError(
          err.response?.data?.detail ||
            "No se pudo cargar el directorio de usuarios."
        );
      } finally {
        setLoading(false);
      }
    },
    [activeRole, canManageUsers, filters]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
    return () => controller.abort();
  }, [fetchUsers]);

  if (!canManageUsers) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <UsersDirectoryTable
        users={users}
        loading={loading}
        error={error}
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={() => fetchUsers()}
        onEditUser={(selectedUser) => setEditingUser(selectedUser)}
        onDeactivateUser={async (userId) => {
          await deactivateUserByAdmin(userId);
          setSuccessMessage("Usuario dado de baja correctamente.");
          fetchUsers();
        }}
      />

      <EditUserDialog
        open={Boolean(editingUser)}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSaved={() => {
          setSuccessMessage("Usuario actualizado correctamente.");
          fetchUsers();
        }}
      />

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSuccessMessage("")}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function App() {
  const navigate = useNavigate();
  const { isAuthenticated, user, activeRole, startSession, hasActiveRole } = useAuth();
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  const menusActivos = MENUS_POR_ROL[activeRole] || [];

  return (
    <Routes>
      <Route
        path="/recuperacion"
        element={
          <div className="hu06-recovery">
            <RequestPinPage navigate={navigate} />
          </div>
        }
      />
      <Route
        path="/recuperacion/pin"
        element={
          window.sessionStorage.getItem("hu06-recovery-email") ? (
            <div className="hu06-recovery">
              <PinStepPage
                email={window.sessionStorage.getItem("hu06-recovery-email")}
                navigate={navigate}
              />
            </div>
          ) : (
            <Navigate to="/recuperacion" replace />
          )
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <AuthScreen
              mostrarRegistro={mostrarRegistro}
              setMostrarRegistro={setMostrarRegistro}
              startSession={startSession}
            />
          )
        }
      />

      <Route
        path="/"
        element={
          !isAuthenticated || !user ? (
            <Navigate to="/login" replace />
          ) : (
            <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
              <Navbar />

              <Container maxWidth="lg" sx={{ py: 4 }}>
                <Card elevation={1}>
                  <CardContent>
                    <Stack spacing={2.5}>
                      <Typography variant="h5" fontWeight={700}>
                        Panel Principal
                      </Typography>

                      <Alert severity="info">
                        Sesión iniciada como <strong>{user.nombre}</strong>. Rol activo actual:{" "}
                        <strong>{activeRole || "Sin rol asignado"}</strong>.
                      </Alert>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Menú habilitado para el rol activo:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {menusActivos.map((opcion) => (
                            <Button
                              key={opcion}
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                if (opcion === "Mis artículos") {
                                  navigate("/mis-articulos");
                                }else if (opcion === "Enviar nueva ponencia") {
                                  navigate("/articulos/nuevo");
                                }
                              }}
                              sx={{ textTransform: "none" }}
                            >
                              {opcion}
                            </Button>
                          ))}
                        </Stack>
                      </Box>

                      {hasActiveRole("ADMIN") && (
                        <Stack spacing={2}>
                          <Alert severity="warning">
                            Permisos de <strong>Administrador</strong> activos: acceso habilitado a gestión
                            de cuentas y parámetros del sistema.
                          </Alert>
                          <CreateUserDialogPreview />
                          <AdminUsersDirectorySection />
                        </Stack>
                      )}

                      {hasActiveRole("COMITE") && (
                        <Stack spacing={2}>
                          <Alert severity="success">
                            Permisos de <strong>Comité Científico</strong> activos: acceso habilitado a
                            revisión y aval de artículos.
                          </Alert>
                          <CreateUserDialogPreview />
                          <AdminUsersDirectorySection />
                        </Stack>
                      )}

                      {hasActiveRole("AUTOR") && (
                        <Alert severity="info" variant="outlined">
                          Permisos de <strong>Autor</strong> activos: acceso habilitado para postular y
                          consultar tus artículos.
                        </Alert>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Container>
            </Box>
          )
        }
      />

      <Route
        path="/mi-perfil"
        element={
          !isAuthenticated || !user ? (
            <Navigate to="/login" replace />
          ) : (
            <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
              <Navbar />
              <ProfileForm />
            </Box>
          )
        }
      />

      <Route
        path="/articulos/nuevo"
        element={
          !isAuthenticated || !user ? (
            <Navigate to="/login" replace />
          ) : (
            <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
              <Navbar />
              <SubmitArticleForm onCancel={() => navigate("/")} />
            </Box>
          )
        }
      />

      <Route
        path="/mis-articulos"
        element={
          !isAuthenticated || !user ? (
            <Navigate to="/login" replace />
          ) : (
            <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
              <Navbar />
              <MyArticlesTable
                onBack={() => navigate("/")}
                onNewArticle={() => navigate("/articulos/nuevo")}
                onSelectArticle={(article) => navigate(`/articulos/${article.id}`)}
              />
            </Box>
          )
        }
      />

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}