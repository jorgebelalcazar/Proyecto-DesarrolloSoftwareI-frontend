import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
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
import UserDeactivationPreview from "./components/UserDeactivationPreview.jsx";
import CoauthorsPreview from "./components/CoauthorsPreview.jsx";
import ArticlesCatalog from "./components/ArticlesCatalog.jsx";
import ArticlesCatalogPreview from "./components/ArticlesCatalogPreview.jsx";
import RegisterForm from "./components/RegisterForm";
import LoginPage from "./components/LoginPage.jsx";
import Navbar from "./components/Navbar.jsx";
import ProfileForm from "./components/ProfileForm.jsx";
import UsersDirectoryTable from "./components/UsersDirectoryTable.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import RequestPinPage from "./pages/RequestPinPage.jsx";
import PinStepPage from "./pages/PinStepPage.jsx";
import { fetchArticles } from "./services/articlesService.js";
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

export default function App() {
  const navigate = useNavigate();
  const { isAuthenticated, user, activeRole, startSession, hasActiveRole } = useAuth();
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const menusActivos = MENUS_POR_ROL[activeRole] || [];
  const isUsersPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).has("preview");
  const isCoauthorsPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).has("preview");
  const isArticlesPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).has("preview");

  return (
    <Routes>
      <Route path="/configuracion-conferencia" element={
        !isAuthenticated || !user ? <Navigate to="/login" replace /> : hasActiveRole(["ADMIN", "COMITE"]) ? <><Navbar /><ConferenceSettingsPage /></> : <Navigate to="/" replace />
      } />
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
                                } else if (opcion === "Configuración de eventos") {
                                  navigate("/configuracion-conferencia");
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
          path="/articulos/:id/editar"
          element={
            !isAuthenticated || !user ? (
              <Navigate to="/login" replace />
            ) : (
              <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
                <Navbar />
                <SubmitArticleForm onCancel={() => navigate("/mis-articulos")} />
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
                onSelectArticle={(article) => setSelectedArticleId(article.id)}
                onEditArticle={(article) => navigate(`/articulos/${article.id}/editar`)}
              />
              <ArticleDetailModal
                open={Boolean(selectedArticleId)}
                articleId={selectedArticleId}
                onClose={() => setSelectedArticleId(null)}
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
