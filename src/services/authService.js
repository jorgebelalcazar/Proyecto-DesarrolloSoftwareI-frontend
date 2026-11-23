import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const LOGIN_ENDPOINT = import.meta.env.VITE_LOGIN_ENDPOINT || "/api/auth/login/";
const LOGOUT_ENDPOINT = import.meta.env.VITE_LOGOUT_ENDPOINT || "/api/auth/logout/";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

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
  const storedToken = localStorage.getItem("access_token");
  const storedRole = localStorage.getItem("active_role");

  if (!accessToken && storedToken) {
    accessToken = storedToken;
  }
  if (!activeRole && storedRole) {
    activeRole = storedRole;
  }

  if (accessToken) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }
  if (activeRole) {
    apiClient.defaults.headers.common["X-Active-Role"] = activeRole;
  }
  return Boolean(accessToken);
}

/**
 * Purga credenciales locales (LocalStorage) y reinicia estados/cabeceras HTTP en el cliente.
 */
export function clearClientAuthState() {
  // 1. Limpieza de credenciales y estados en LocalStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("active_role");
  localStorage.removeItem("user");

  // 2. Reinicio de variables en memoria y cabeceras globales de Axios
  setAccessToken(null);
  setActiveRole(null);
  delete apiClient.defaults.headers.common.Authorization;
  delete apiClient.defaults.headers.common["X-Active-Role"];
  delete axios.defaults.headers.common.Authorization;
}

// Interceptor de petición: sincroniza token y rol en cada request saliente
apiClient.interceptors.request.use(
  (config) => {
    const token = accessToken || localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const role = activeRole || localStorage.getItem("active_role");
    if (role) {
      config.headers["X-Active-Role"] = role;
    }
    const isAuthRoute = config.url?.includes("/auth/login") || config.url?.includes("/auth/register");
    if (role && !isAuthRoute) {
      config.headers["X-Active-Role"] = role;
    } else {
      delete config.headers["X-Active-Role"];
      delete apiClient.defaults.headers.common["X-Active-Role"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: limpia credenciales automáticamente ante un 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearClientAuthState();
    }
    return Promise.reject(error);
  }
);

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
  localStorage.setItem("access_token", token);

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

  localStorage.setItem("user", JSON.stringify(user));

  const rawRoles = data.roles || rawUser?.roles || [];
  const roles = rawRoles.map((rol) =>
    typeof rol === "string" ? rol : rol.nombre || rol.codigo || String(rol)
  );
  const initialRole = data.active_role || data.rol_activo || roles[0] || null;

  setActiveRole(initialRole);
  if (initialRole) {
    localStorage.setItem("active_role", initialRole);
  }

  return { user, roles, activeRole: initialRole };
}

export async function logoutUser() {
  const refreshToken = localStorage.getItem("refresh_token");

  try {
    await apiClient.post(LOGOUT_ENDPOINT, refreshToken ? { refresh: refreshToken } : {});
  } catch (error) {
    console.warn("Aviso al cerrar sesión en backend:", error?.message);
  } finally {
    clearClientAuthState();
  }
}

// Alias exportado por compatibilidad si algún componente de tu compañero llama a logout()
export const logout = logoutUser;

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