import { apiClient } from "./authService";

export async function getThematicLines() {
  const { data } = await apiClient.get("/api/lineas-tematicas/");
  return Array.isArray(data) ? data : data?.results || [];
}

export async function createArticleProposal(payload) {
  const { data } = await apiClient.post("/api/articulos/", payload);
  return data;
}

export async function getArticleDetail(articleId) {
  const { data } = await apiClient.get(`/api/articulos/${articleId}/`);
  return data;
}

export async function uploadArticleInitialPdf(articleId, pdfFile, onProgress) {
  const formData = new FormData();
  formData.append("archivo", pdfFile);

  const { data } = await apiClient.post(
    `/api/articulos/${articleId}/subir-pdf/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return;
        const percent = Math.min(
          100,
          Math.round((progressEvent.loaded * 100) / progressEvent.total)
        );
        onProgress?.(percent);
      },
    }
  );

  return data;
}

export async function getMyArticles(params = {}) {
  const cleanParams = {};
  if (params.estado) cleanParams.estado = params.estado;
  if (params.linea_tematica) cleanParams.linea_tematica = params.linea_tematica;

  const { data } = await apiClient.get("/api/articulos/mis-articulos/", {
    params: cleanParams,
  });
  return Array.isArray(data) ? data : data?.results || [];
}

export async function getArticleById(articleId) {
  const { data } = await apiClient.get(`/api/articulos/${articleId}/`);
  return data;
}

export async function updateArticleMetadata(articleId, payload) {
  const { data } = await apiClient.patch(`/api/articulos/${articleId}/`, payload);
  return data;
}