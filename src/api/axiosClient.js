import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de petición: adjunta el token activo si existe en localStorage
const requestInterceptorId = axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta: limpia credenciales si el token expiró o fue invalidado (401)
const responseInterceptorId = axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearClientAuthState();
    }
    return Promise.reject(error);
  }
);

/**
 * Purga credenciales locales y reinicia cabeceras/estados globales HTTP en el cliente.
 */
export function clearClientAuthState() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  // Limpia cabeceras globales tanto en la instancia como en axios por defecto
  delete axiosClient.defaults.headers.common["Authorization"];
  delete axios.defaults.headers.common["Authorization"];
}

export { requestInterceptorId, responseInterceptorId };
export default axiosClient;