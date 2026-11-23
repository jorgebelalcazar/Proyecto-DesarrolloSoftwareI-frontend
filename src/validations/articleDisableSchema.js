import { z } from "zod";

export const articleDisableSchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(10, "Describe el motivo con al menos 10 caracteres.")
    .max(1000, "El motivo no puede superar los 1000 caracteres."),
});
