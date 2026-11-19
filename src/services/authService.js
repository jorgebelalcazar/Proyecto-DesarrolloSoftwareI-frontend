import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const LOGIN_ENDPOINT = import.meta.env.VITE_LOGIN_ENDPOINT || "/api/auth/login/";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Keep the access JWT in memory. The server should use a Secure, HttpOnly
// cookie for refresh/session continuity instead of exposing a persistent token
// to JavaScript storage such as localStorage.
let accessToken = null;
let activeRole = null;

export function setAccessToken(token) {
  accessToken = token || null;

  if (accessToken) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

export function setActiveRole(role) {
  activeRole = role || null;

  if (activeRole) {
    apiClient.defaults.headers.common["X-Active-Role"] = activeRole;
  } else {
    delete apiClient.defaults.headers.common["X-Active-Role"];
  }
}

export function getActiveRole() {
  return activeRole;
}

export function initializeAuth() {
  if (accessToken) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }
  if (activeRole) {
    apiClient.defaults.headers.common["X-Active-Role"] = activeRole;
  }
  return Boolean(accessToken);
}

export async function login({ email, password, captchaToken }) {
  const response = await apiClient.post(LOGIN_ENDPOINT, {
    correo: email,
    clave: password,
    captcha: captchaToken,
  });

  const data = response.data;
  const token = data.access_token || data.access || data.token;

  if (!token) {
    throw new Error("El servidor no devolvió un token de acceso válido.");
  }

  setAccessToken(token);

  const rawUser = data.user || data.usuario || null;
  const user = rawUser
    ? {
        ...rawUser,
        nombre:
          rawUser.nombre ||
          [rawUser.nombres, rawUser.apellidos].filter(Boolean).join(" ") ||
          rawUser.correo ||
          email,
        email: rawUser.email || rawUser.correo || email,
      }
    : { nombre: email, email };

  const rawRoles = data.roles || rawUser?.roles || [];
  const roles = rawRoles.map((rol) =>
    typeof rol === "string" ? rol : rol.nombre || rol.codigo || String(rol)
  );
  const initialRole = data.active_role || data.rol_activo || roles[0] || null;

  setActiveRole(initialRole);

  return { user, roles, activeRole: initialRole };
}

export function logout() {
  setAccessToken(null);
  setActiveRole(null);
}

export function getErrorMessage(error) {
  if (!error?.response) {
    return "No fue posible conectar con el servidor. Verifica que esté disponible.";
  }

  const { status, data } = error.response;

  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  if (Array.isArray(data?.non_field_errors) && data.non_field_errors[0]) {
    return data.non_field_errors[0];
  }
  if (Array.isArray(data?.captcha) && data.captcha[0]) {
    return data.captcha[0];
  }
  if (Array.isArray(data?.correo) && data.correo[0]) {
    return data.correo[0];
  }
  if (Array.isArray(data?.clave) && data.clave[0]) {
    return data.clave[0];
  }

  if (status === 400 || status === 401) {
    return "Credenciales inválidas o datos incompletos. Verifica e intenta de nuevo.";
  }

  return "El servidor no pudo procesar el inicio de sesión. Intenta más tarde.";
}