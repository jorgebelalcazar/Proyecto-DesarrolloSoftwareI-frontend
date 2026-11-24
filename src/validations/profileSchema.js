import { z } from "zod";

export const profileSchema = z.object({
  nombres: z
    .string()
    .trim()
    .min(1, "Los nombres son obligatorios")
    .min(2, "Debe tener al menos 2 caracteres"),
  apellidos: z
    .string()
    .trim()
    .min(1, "Los apellidos son obligatorios")
    .min(2, "Debe tener al menos 2 caracteres"),
  correo: z
    .string()
    .trim()
    .min(1, "El correo electrónico es obligatorio")
    .email("Correo electrónico inválido"),
  afiliacion: z
    .string()
    .trim()
    .min(1, "La afiliación institucional es obligatoria")
    .min(2, "Ingresa una institución o universidad válida"),
  pais: z
    .string()
    .trim()
    .min(1, "El país es obligatorio")
    .min(2, "Ingresa un país válido"),
});