import { useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import CreateUserDialogPreview from "./components/CreateUserDialogPreview.jsx";
import UserDeactivationPreview from "./components/UserDeactivationPreview.jsx";
import CoauthorsPreview from "./components/CoauthorsPreview.jsx";
import ArticlesCatalog from "./components/ArticlesCatalog.jsx";
import ArticlesCatalogPreview from "./components/ArticlesCatalogPreview.jsx";
import ArticleDisablePanel from "./components/ArticleDisablePanel.jsx";
import ArticleDisablePreview from "./components/ArticleDisablePreview.jsx";
import RegisterForm from "./components/RegisterForm";
import LoginPage from "./components/LoginPage.jsx";
import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import RequestPinPage from "./pages/RequestPinPage.jsx";
import PinStepPage from "./pages/PinStepPage.jsx";
import { disableArticle, fetchArticles } from "./services/articlesService.js";
import "./recovery.css";

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

function CommitteeDisablePage() {
  const { articleId } = useParams();

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 6 } }}>
      <ArticleDisablePanel
        article={{ id: articleId, titulo: "Artículo seleccionado", autor: "", estado: "En revisión" }}
        onDisable={disableArticle}
      />
    </Container>
  );
}

export default function App() {
  const navigate = useNavigate();
  const { isAuthenticated, user, activeRole, startSession, hasActiveRole } = useAuth();
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  const menusActivos = MENUS_POR_ROL[activeRole] || [];
  const isUsersPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).has("preview");
  const isCoauthorsPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).has("preview");
  const isArticlesPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).has("preview");
  const isDisablePreview = import.meta.env.DEV && new URLSearchParams(window.location.search).has("preview");

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
        path="/admin/usuarios"
        element={
          isUsersPreview || hasActiveRole(["ADMIN", "COMITE"]) ? (
            <UserDeactivationPreview />
          ) : (
            <Navigate to={isAuthenticated ? "/" : "/login"} replace />
          )
        }
      />

      <Route
        path="/articulos/coautores"
        element={
          isCoauthorsPreview || hasActiveRole("AUTOR") ? (
            <CoauthorsPreview />
          ) : (
            <Navigate to={isAuthenticated ? "/" : "/login"} replace />
          )
        }
      />

      <Route
        path="/articulos/catalogo"
        element={
          isArticlesPreview ? (
            <ArticlesCatalogPreview />
          ) : hasActiveRole(["ADMIN", "COMITE"]) ? (
            <ArticlesCatalog fetchArticles={fetchArticles} />
          ) : (
            <Navigate to={isAuthenticated ? "/" : "/login"} replace />
          )
        }
      />

      <Route
        path="/articulos/:articleId/deshabilitar"
        element={
          isDisablePreview ? (
            <ArticleDisablePreview />
          ) : hasActiveRole("COMITE") ? (
            <CommitteeDisablePage />
          ) : (
            <Navigate to={isAuthenticated ? "/" : "/login"} replace />
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

              <Container maxWidth="md" sx={{ py: 4 }}>
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
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => navigate("/admin/usuarios")}
                            sx={{ alignSelf: "flex-start", textTransform: "none" }}
                          >
                            Gestión de bajas de usuarios
                          </Button>
                        </Stack>
                      )}

                      {hasActiveRole("COMITE") && (
                        <Stack spacing={1.5} alignItems="flex-start">
                          <Alert severity="success">
                            Permisos de <strong>Comité Científico</strong> activos: acceso habilitado a
                            revisión, aval de artículos y gestión de bajas.
                          </Alert>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => navigate("/admin/usuarios")}
                            sx={{ textTransform: "none" }}
                          >
                            Gestión de bajas de usuarios
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => navigate("/articulos/catalogo")}
                            sx={{ textTransform: "none" }}
                          >
                            Consultar catálogo de artículos
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => navigate("/articulos/ART-0264/deshabilitar")}
                            sx={{ textTransform: "none" }}
                          >
                            Supervisar y deshabilitar artículo
                          </Button>
                        </Stack>
                      )}

                      {hasActiveRole("ADMIN") && (
                        <Button
                          variant="outlined"
                          onClick={() => navigate("/articulos/catalogo")}
                          sx={{ alignSelf: "flex-start", textTransform: "none" }}
                        >
                          Consultar catálogo de artículos
                        </Button>
                      )}

                      {hasActiveRole("AUTOR") && (
                        <Stack spacing={1.5} alignItems="flex-start">
                          <Alert severity="info" variant="outlined">
                            Permisos de <strong>Autor</strong> activos: acceso habilitado para postular y
                            consultar tus artículos.
                          </Alert>
                          <Button
                            variant="outlined"
                            onClick={() => navigate("/articulos/coautores")}
                            sx={{ textTransform: "none" }}
                          >
                            Editar coautores del artículo
                          </Button>
                        </Stack>
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
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
