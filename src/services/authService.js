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

export function setAccessToken(token) {
  accessToken = token || null;

  if (accessToken) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

export function initializeAuth() {
  if (accessToken) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }
  return Boolean(accessToken);
}

export async function login({ email, password, captchaToken }) {
  const response = await apiClient.post(LOGIN_ENDPOINT, {
    email,
    password,
    captcha_token: captchaToken,
  });

  const data = response.data;
  const token = data.access_token || data.access || data.token;

  if (!token) {
    throw new Error("El servidor no devolvió un token de acceso válido.");
  }

  setAccessToken(token);

  const user = data.user || data.usuario || null;
  const roles = data.roles || user?.roles || [];

  return { user, roles };
}

export function logout() {
  setAccessToken(null);
}
