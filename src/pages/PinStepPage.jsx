import { useState } from "react";

export default function PinStepPage({ email, navigate }) {
  const [pin, setPin] = useState("");

  function handlePinChange(event) {
    setPin(event.target.value.replace(/\D/g, "").slice(0, 6));
  }

  return (
    <main className="page-shell">
      <section className="recovery-card" aria-labelledby="pin-title">
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true">A</div>
          <span>Portal académico</span>
        </div>

        <div className="step-track" aria-label="Paso 2 de 2">
          <span className="step-dot complete">✓</span>
          <span className="step-line complete-line" />
          <span className="step-dot active">2</span>
          <span className="step-caption">SOLICITAR CÓDIGO</span>
          <span className="step-caption second-caption">VERIFICAR CÓDIGO</span>
        </div>

        <div className="illustration mail-illustration" aria-hidden="true">
          <svg viewBox="0 0 96 96" role="presentation">
            <rect x="12" y="23" width="72" height="52" rx="12" fill="#e7efff" />
            <path d="m19 32 29 22 29-22" fill="none" stroke="#3568d4" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="73" cy="69" r="13" fill="#35a879" stroke="white" strokeWidth="4" />
            <path d="m67 69 4 4 8-9" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="eyebrow">PASO 2 DE 2</p>
        <h1 id="pin-title">Revisa tu correo</h1>
        <p className="intro">
          Si encontramos una cuenta asociada a <strong>{email}</strong>, recibirás
          un código de seis dígitos. Escríbelo aquí para continuar.
        </p>

        <label htmlFor="pin">Código de verificación</label>
        <input
          id="pin"
          className="pin-input"
          name="pin"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000"
          value={pin}
          onChange={handlePinChange}
          aria-describedby="pin-help"
        />
        <p id="pin-help" className="field-help centered-help">
          El código vence en 15 minutos. La validación se habilitará al integrar el backend de HU-07.
        </p>

        <button className="primary-button" type="button" disabled title="La verificación se habilitará al integrar HU-07">
          Validar código <span aria-hidden="true">→</span>
        </button>
        <button className="text-button" type="button" onClick={() => navigate("/recuperacion")}>
          <span aria-hidden="true">←</span> Cambiar correo
        </button>
        <footer className="card-footer">
          <span className="footer-lock" aria-hidden="true">◈</span>
          Tu información está protegida
        </footer>
      </section>
      <p className="page-note">¿Necesitas ayuda? Contacta al equipo de soporte.</p>
    </main>
  );
}
