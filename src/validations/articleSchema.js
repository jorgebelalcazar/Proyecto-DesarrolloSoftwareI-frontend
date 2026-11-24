import { z } from "zod";

export const MAX_ABSTRACT_WORDS = 300;

export function countWords(text = "") {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export const articleSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "El título del artículo es obligatorio.")
    .min(10, "El título debe tener al menos 10 caracteres.")
    .max(250, "El título no puede superar los 250 caracteres."),
  linea_tematica: z
    .union([z.number(), z.string()])
    .refine(
      (val) => val !== "" && val !== null && val !== undefined && Number(val) > 0,
      "Debes seleccionar una de las 5 líneas temáticas oficiales."
    ),
  resumen: z
    .string()
    .trim()
    .min(1, "El resumen del artículo es obligatorio.")
    .refine(
      (val) => countWords(val) <= MAX_ABSTRACT_WORDS,
      `El resumen no puede exceder las ${MAX_ABSTRACT_WORDS} palabras.`
    ),
  palabras_clave: z
    .array(z.string().trim().min(1))
    .min(1, "Agrega al menos una palabra clave para indexar el artículo.")
    .max(10, "Puedes agregar máximo 10 palabras clave."),
});