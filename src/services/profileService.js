import { apiClient } from "./authService";

export async function getMyProfile() {
  const { data } = await apiClient.get("/api/usuarios/mi-perfil/");
  return data;
}

export async function updateMyProfile(profileData) {
  const payload = {
    nombres: profileData.nombres.trim(),
    apellidos: profileData.apellidos.trim(),
    correo: profileData.correo.trim(),
    afiliacion: profileData.afiliacion.trim(),
    pais: profileData.pais.trim(),
  };

  const { data } = await apiClient.patch("/api/usuarios/mi-perfil/", payload);
  return data;
}

/*
// MOCK TEMPORAL PARA PRUEBAS SIN BACK-END (Recordar revertir antes del commit final)
let mockProfile = {
  nombres: "Juan Carlos",
  apellidos: "Fuentes",
  correo: "juancarlos.fuentes@correounivalle.edu.co",
  afiliacion: "Universidad del Valle",
  pais: "Colombia",
  roles: ["AUTOR"],
  especialidades: ["Sistemas de Software", "Sistemas Inteligentes"],
};

export async function getMyProfile() {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { ...mockProfile };
}

export async function updateMyProfile(profileData) {
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Descomenta la siguiente línea si quieres probar también la alerta roja de error:
  //throw { response: { data: { correo: ["Este correo electrónico ya está en uso."] } } };

  mockProfile = {
    ...mockProfile,
    nombres: profileData.nombres.trim(),
    apellidos: profileData.apellidos.trim(),
    correo: profileData.correo.trim(),
    afiliacion: profileData.afiliacion.trim(),
    pais: profileData.pais.trim(),
  };

  return { ...mockProfile };
}*/