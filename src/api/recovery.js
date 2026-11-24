const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

export async function requestRecoveryPin(email, captchaToken) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/solicitar-pin/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: email, captcha: captchaToken }),
    });
  } catch {
    throw new Error(
      "No pudimos conectar con el servidor. Comprueba que el backend esté iniciado.",
    );
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    // Si el servidor devolvió una respuesta sin JSON, usamos un mensaje claro abajo.
  }

  if (!response.ok) {
    const detail =
      data.detail ||
      data.correo?.[0] ||
      data.captcha?.[0] ||
      "No fue posible enviar el código. Inténtalo de nuevo.";
    throw new Error(detail);
  }

  return data;
}
