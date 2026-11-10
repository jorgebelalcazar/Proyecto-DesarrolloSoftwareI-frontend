import { z } from "zod";

export const recoverySchema = z
  .object({
    correo: z.string().trim().email("Ingresa un correo electrónico válido."),
    pin: z.string().regex(/^\d{6}$/, "Ingresa los 6 dígitos del PIN."),
    clave: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .regex(/[A-Z]/, "Incluye al menos una letra mayúscula.")
      .regex(/[^A-Za-z0-9\s]/, "Incluye al menos un carácter especial."),
    confirmarClave: z.string().min(1, "Confirma tu nueva contraseña."),
  })
  .refine((datos) => datos.clave === datos.confirmarClave, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmarClave"],
  });
