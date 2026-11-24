import { useEffect, useMemo, useState } from "react";

const LOCKED_ARTICLE_STATES = [
  "EN_REVISION",
  "APROBADO",
  "ACEPTADO",
  "RECHAZADO",
  "PUBLICADO",
];

function parseDeadline(article, callConfig) {
  const rawDate =
  article?.fecha_limite_modificacion ||
  article?.limite_postulacion ||
  callConfig?.limite_postulacion ||
  callConfig?.fecha_limite_modificacion ||
  callConfig?.fecha_cierre_recepcion ||
  callConfig?.fecha_cierre ||
  null;

  if (!rawDate) return null;
  const parsed = new Date(rawDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function useModificationWindow(article = null, callConfig = null) {
  const [now, setNow] = useState(() => Date.now());

  const deadline = useMemo(
    () => parseDeadline(article, callConfig),
    [article, callConfig]
  );

  // Programa un bloqueo automático en tiempo real si el usuario tiene el formulario abierto al vencer el plazo
  useEffect(() => {
    if (!deadline) return;
    const msRemaining = deadline.getTime() - Date.now();
    if (msRemaining <= 0) return;

    // setTimeout soporta hasta ~24.8 días (2^31 - 1 ms)
    const safeDelay = Math.min(msRemaining + 250, 2147483647);
    const timer = setTimeout(() => {
      setNow(Date.now());
    }, safeDelay);

    return () => clearTimeout(timer);
  }, [deadline]);

  return useMemo(() => {
    // 1. Banderas explícitas enviadas por el backend
    if (
      article?.puede_editarse === false ||
      article?.edicion_habilitada === false ||
      article?.convocatoria_cerrada === true ||
      callConfig?.esta_cerrada === true
    ) {
      return {
        isLocked: true,
        deadline,
        reason:
          "La convocatoria ha cerrado o el artículo ya no tiene habilitada la edición.",
      };
    }

    // 2. Estados del flujo editorial que ya no admiten cambios del autor
    const currentStatus = (article?.estado || "").toUpperCase();
    if (LOCKED_ARTICLE_STATES.includes(currentStatus)) {
      return {
        isLocked: true,
        deadline,
        reason: `El artículo se encuentra en estado "${article.estado}" y no admite modificaciones.`,
      };
    }

    // 3. Validación contra fecha/hora límite de modificación
    if (deadline && now >= deadline.getTime()) {
      const formattedDeadline = deadline.toLocaleString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        isLocked: true,
        deadline,
        reason: `El plazo permitido de modificación venció el ${formattedDeadline}. Los campos se muestran en modo de solo lectura.`,
      };
    }

    return {
      isLocked: false,
      deadline,
      reason: "",
    };
  }, [article, callConfig, deadline, now]);
}