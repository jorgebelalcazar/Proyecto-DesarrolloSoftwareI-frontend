import axiosClient, { clearClientAuthState } from "../api/axiosClient";

export async function logoutUser() {
  const refreshToken = localStorage.getItem("refresh_token");

  try {
    // Intenta invalidar el token en el backend (ej. blacklist de JWT en DRF)
    await axiosClient.post("/auth/logout/", {
      refresh: refreshToken,
    });
  } catch (error) {
    // Si el token ya expiró o el servidor no responde, continuamos con la limpieza local
    console.warn("Aviso al invalidar sesión en backend:", error?.message);
  } finally {
    // 1. Elimina credenciales almacenadas localmente
    // 2. Reinicia los encabezados HTTP globales del cliente
    clearClientAuthState();
  }
}