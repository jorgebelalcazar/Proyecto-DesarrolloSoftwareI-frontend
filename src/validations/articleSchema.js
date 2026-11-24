import { z } from "zod";

export const MAX_ABSTRACT_WORDS = 300;
export const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function countWords(text = "") {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function validatePdfFile(file) {
  if (!file) {
    return "Debes adjuntar el manuscrito en formato PDF.";
  }

  const hasPdfExtension = file.name?.toLowerCase().endsWith(".pdf");
  const hasPdfMime =
    file.type === "application/pdf" || file.type === "";

  if (!hasPdfExtension || !hasPdfMime) {
    return "Formato inválido: solo se permiten archivos con extensión .pdf.";
  }

  if (file.size <= 0) {
    return "El archivo PDF seleccionado está vacío.";
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return `El archivo pesa ${sizeMb} MB y supera el límite máximo permitido de 10 MB.`;
  }

  return null;
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