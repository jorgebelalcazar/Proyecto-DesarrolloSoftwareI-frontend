import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { requestRecoveryPin } from "../api/recovery.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

export default function RequestPinPage({ navigate }) {
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const recaptchaRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Escribe un correo electrónico válido, por ejemplo nombre@correo.com.");
      setStatus("error");
      return;
    }

    if (!captchaToken) {
      setError("Por favor completa la verificación reCAPTCHA antes de continuar.");
      setStatus("error");
      return;
    }

    setError("");
    setStatus("loading");

    try {
      await requestRecoveryPin(normalizedEmail, captchaToken);
      window.sessionStorage.setItem("hu06-recovery-email", normalizedEmail);
      setStatus("success");
      window.setTimeout(() => navigate("/recuperacion/pin"), 900);
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
      setCaptchaToken("");
      recaptchaRef.current?.reset();
    }
  }

  const isLoading = status === "loading";

  return (
    <main className="page-shell">
      <section className="recovery-card" aria-labelledby="page-title">
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true">A</div>
          <span>Portal académico</span>
        </div>

        <div className="step-track" aria-label="Paso 1 de 2">
          <span className="step-dot active">1</span>
          <span className="step-line" />
          <span className="step-dot">2</span>
          <span className="step-caption">SOLICITAR CÓDIGO</span>
          <span className="step-caption second-caption">VERIFICAR CÓDIGO</span>
        </div>

        <div className="illustration" aria-hidden="true">
          <svg viewBox="0 0 96 96" role="presentation">
            <rect x="14" y="40" width="68" height="44" rx="12" fill="#e7efff" />
            <path d="M29 40V30a19 19 0 0 1 38 0v10" fill="none" stroke="#3568d4" strokeWidth="7" strokeLinecap="round" />
            <circle cx="48" cy="59" r="6" fill="#3568d4" />
            <path d="M48 64v8" stroke="#3568d4" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>

        <p className="eyebrow">RECUPERACIÓN DE CUENTA</p>
        <h1 id="page-title">¿Olvidaste tu contraseña?</h1>
        <p className="intro">
          No te preocupes. Escribe el correo asociado a tu cuenta y te enviaremos
          un código para continuar.
        </p>

        <form onSubmit={handleSubmit} noValidate aria-busy={isLoading}>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="correo"
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            placeholder="nombre@correo.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status === "error") {
                setStatus("idle");
                setError("");
              }
            }}
            disabled={isLoading || status === "success"}
            aria-invalid={status === "error"}
            aria-describedby={status === "error" ? "form-message" : "email-help"}
            required
          />
          <p id="email-help" className="field-help">Usaremos este correo únicamente para enviarte el código.</p>

          <div style={{ margin: "16px 0", display: "flex", justifyContent: "center" }}>
            {SITE_KEY ? (
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={SITE_KEY}
                onChange={(token) => {
                  setCaptchaToken(token || "");
                  if (status === "error") {
                    setStatus("idle");
                    setError("");
                  }
                }}
                onExpired={() => setCaptchaToken("")}
              />
            ) : (
              <div className="notice error" role="alert">
                <span className="notice-icon" aria-hidden="true">!</span>
                <span>Falta configurar <strong>VITE_RECAPTCHA_SITE_KEY</strong> en el archivo <code>.env</code>.</span>
              </div>
            )}
          </div>

          {status === "error" && (
            <div id="form-message" className="notice error" role="alert">
              <span className="notice-icon" aria-hidden="true">!</span>
              <span>{error}</span>
            </div>
          )}

          {status === "success" && (
            <div className="notice success" role="status" aria-live="polite">
              <span className="notice-icon" aria-hidden="true">✓</span>
              <span>Solicitud recibida. Si existe una cuenta, enviaremos el código al correo indicado.</span>
            </div>
          )}

          <button className="primary-button" type="submit" disabled={isLoading || status === "success"}>
            {isLoading ? (
              <><span className="spinner" aria-hidden="true" /> Enviando código…</>
            ) : status === "success" ? (
              <>Continuando <span aria-hidden="true">→</span></>
            ) : (
              <>Enviar código <span aria-hidden="true">→</span></>
            )}
          </button>
        </form>

        <footer className="card-footer">
          <span className="footer-lock" aria-hidden="true">◈</span>
          Tu información está protegida
        </footer>
      </section>
      <p className="page-note">¿Necesitas ayuda? Contacta al equipo de soporte.</p>
    </main>
  );
}