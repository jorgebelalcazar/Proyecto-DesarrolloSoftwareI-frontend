import { apiClient } from "./authService";

const ARTICLES_ENDPOINT = import.meta.env.VITE_ARTICLES_ENDPOINT || "/api/articulos/";

/** Queries the catalog using the same names reflected in the browser URL. */
export async function fetchArticles(filters) {
  const response = await apiClient.get(ARTICLES_ENDPOINT, {
    params: {
      linea_tematica: filters.linea || undefined,
      estado: filters.estado || undefined,
      q: filters.texto || undefined,
    },
  });

  // Supports a paginated DRF response and a plain array response.
  return Array.isArray(response.data) ? response.data : response.data.results || [];
}
