import { z } from "zod";

export const profileSchema = z.object({
  nombreCompleto: z.string().min(3, "El nombre completo es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  telefono: z.string().min(7, "Número de teléfono inválido"),
  institucion: z.string().min(2, "La institución o universidad es requerida"),
  facultad: z.string().min(2, "La facultad o departamento es requerido"),
  pais: z.string().min(2, "El país es requerido"),
  lineaTematica: z.string().min(2, "Selecciona una línea temática"),
});