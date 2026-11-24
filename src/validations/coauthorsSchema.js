import { z } from "zod";

const coauthorSchema = z.object({
  nombreCompleto: z.string().trim().min(3, "Escribe el nombre completo del firmante."),
  afiliacion: z.string().trim().min(2, "Escribe la institución o afiliación."),
  correo: z.string().trim().email("Escribe un correo electrónico válido."),
});

export const coauthorsSchema = z
  .object({
    coautores: z.array(coauthorSchema).min(1, "Agrega al menos un coautor o firmante."),
  })
  .superRefine(({ coautores }, context) => {
    const correos = new Map();

    coautores.forEach((coautor, index) => {
      const correoNormalizado = coautor.correo.trim().toLowerCase();
      if (!correoNormalizado) return;

      const duplicateIndex = correos.get(correoNormalizado);
      if (duplicateIndex !== undefined) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["coautores", index, "correo"],
          message: "Este correo ya fue agregado a otro firmante.",
        });
      } else {
        correos.set(correoNormalizado, index);
      }
    });
  });
