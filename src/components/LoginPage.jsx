import { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { initializeAuth, login } from "../services/authService";

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export default function LoginPage({onLoginSuccess}) {
  const captchaRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!captchaToken) {
      setError("Completa el reCAPTCHA para continuar.");
      return;
    }

    setLoading(true);
    try {
      const result = await login({ email: email.trim(), password, captchaToken });
      setSession(result);
      setPassword("");
      onLoginSuccess?.(result);

    } catch (requestError) {
      const status = requestError.response?.status;
      if (status === 401) {
        setError("No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.");
      } else if (requestError.response) {
        setError("El servidor no pudo procesar el inicio de sesión. Intenta más tarde.");
      } else {
        setError("No fue posible conectar con el servidor. Verifica que esté disponible.");
      }
      setSession(null);
    } finally {
      setLoading(false);
      setCaptchaToken(null);
      captchaRef.current?.reset();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: { xs: 3, sm: 5 },
        bgcolor: "#f2f5fa",
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ border: "1px solid #d8e1ef", borderRadius: 3, boxShadow: "0 8px 32px #172b4d12" }}>
          <CardContent sx={{ p: { xs: 3, sm: 5 }, "&:last-child": { pb: { xs: 3, sm: 5 } } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="overline" sx={{ color: "#2859d8", fontWeight: 700, letterSpacing: 1 }}>
                  Sistema de Gestión
                </Typography>
                <Typography variant="h4" component="h1" fontWeight={700} sx={{ color: "#1d3150", mt: 0.5 }}>
                  Iniciar sesión
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Ingresa tus credenciales para acceder a tu cuenta.
                </Typography>
              </Box>

              {session ? (
                <Alert severity="success">
                  Sesión iniciada correctamente.
                  {session.user?.nombre ? ` Bienvenido, ${session.user.nombre}.` : ""}
                  {session.roles.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
                      {session.roles.map((role) => <Chip key={role} size="small" label={role} />)}
                    </Box>
                  )}
                </Alert>
              ) : (
                <Box component="form" onSubmit={submit} noValidate>
                  <Stack spacing={2.25}>
                    <TextField
                      required
                      fullWidth
                      type="email"
                      label="Correo electrónico"
                      autoComplete="username"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                    <TextField
                      required
                      fullWidth
                      label="Contraseña"
                      type={passwordVisible ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                                onClick={() => setPasswordVisible((visible) => !visible)}
                                edge="end"
                              >
                                {passwordVisible ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />

                    {siteKey ? (
                      <Box sx={{ display: "flex", justifyContent: "center", overflowX: "auto", py: 0.5 }}>
                        <ReCAPTCHA
                          ref={captchaRef}
                          sitekey={siteKey}
                          onChange={(token) => { setCaptchaToken(token); setError(""); }}
                          onExpired={() => setCaptchaToken(null)}
                          onErrored={() => {
                            setCaptchaToken(null);
                            setError("No se pudo cargar reCAPTCHA. Actualiza la página o inténtalo más tarde.");
                          }}
                        />
                      </Box>
                    ) : (
                      <Alert severity="warning">
                        Falta configurar <code>VITE_RECAPTCHA_SITE_KEY</code> para habilitar el inicio de sesión.
                      </Alert>
                    )}

                    {error && <Alert severity="error">{error}</Alert>}

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={!siteKey || !captchaToken || !email.trim() || !password || loading}
                      sx={{ textTransform: "none", borderRadius: 2, py: 1.25, bgcolor: "#2859d8" }}
                    >
                      {loading ? "Verificando…" : "Ingresar"}
                    </Button>
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
