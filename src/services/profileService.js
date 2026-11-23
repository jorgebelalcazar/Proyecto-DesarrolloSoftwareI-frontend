import { apiClient } from "./authService";

export async function getMyProfile() {
  const { data } = await apiClient.get("/api/usuarios/mi-perfil/");
  return data;
}