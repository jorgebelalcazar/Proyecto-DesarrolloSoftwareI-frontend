import { apiClient } from "./authService";

export async function getThematicLines() {
  const { data } = await apiClient.get("/api/lineas-tematicas/");
  return Array.isArray(data) ? data : data?.results || [];
}

export async function updateUserByAdmin(userId, payload) {
  const { data } = await apiClient.patch(`/api/usuarios/${userId}/`, payload);
  return data;
}

/*
// MOCK TEMPORAL PARA PRUEBAS SIN BACK-END (Revertir antes del commit final)
export async function getThematicLines() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [
    { id: 1, nombre: "Sistemas Inteligentes" },
    { id: 2, nombre: "Tecnologías en Informática" },
    { id: 3, nombre: "Educación en Informática" },
    { id: 4, nombre: "Sistemas de Software" },
    { id: 5, nombre: "Software en la práctica" },
  ];
}

export async function updateUserByAdmin(userId, payload) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    id: userId,
    ...payload,
  };
}*/