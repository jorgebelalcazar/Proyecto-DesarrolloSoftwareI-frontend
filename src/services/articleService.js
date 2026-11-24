import { apiClient } from "./authService";

export async function getThematicLines() {
  const { data } = await apiClient.get("/api/lineas-tematicas/");
  return Array.isArray(data) ? data : data?.results || [];
}

export async function createArticleProposal(payload) {
  const { data } = await apiClient.post("/api/articulos/", payload);
  return data;
}