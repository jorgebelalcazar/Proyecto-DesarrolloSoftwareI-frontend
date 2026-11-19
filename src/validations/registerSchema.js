import { z } from "zod";

export const registerSchema = z
  .object({
    nombreCompleto: z
      .string()
      .trim()
      .min(1, "El nombre completo es obligatorio")
      .min(3, "Debe tener al menos 3 caracteres"),
    email: z
      .string()
      .trim()
      .min(1, "El correo electrónico es obligatorio")
      .email("Ingresa un correo electrónico con formato válido"),
    institucion: z
      .string()
      .trim()
      .min(1, "La afiliación institucional es obligatoria")
      .min(2, "Ingresa una institución o universidad válida"),
    pais: z
      .string()
      .trim()
      .min(1, "El país es obligatorio")
      .min(2, "Ingresa un país válido"),
    password: z
      .string()
      .min(1, "La contraseña es obligatoria")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
      .regex(/[a-z]/, "Debe incluir al menos una letra minúscula")
      .regex(/[0-9]/, "Debe incluir al menos un número"),
    confirmPassword: z
      .string()
      .min(1, "Debes confirmar la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });