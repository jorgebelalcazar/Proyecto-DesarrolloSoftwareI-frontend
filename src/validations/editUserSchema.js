import { z } from "zod";

export const VALID_ROLE_CODES = ["ADMIN", "COMITE", "AUTOR"];

export const editUserSchema = z.object({
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
    .email("Ingresa un correo electrónico válido"),
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
  roles: z
    .array(z.enum(VALID_ROLE_CODES))
    .min(1, "El usuario debe tener al menos un rol asignado"),
  especialidades: z
    .array(z.string().trim().min(1))
    .default([]),
});