import Link from 'next/link';
import { registerAction } from '@/app/actions';

export default function RegisterPage() {
  return (
    <div className="auth-wrap">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📄</div>
          <span>RFP Copilot</span>
        </div>

        <div className="auth-head">
          <h1>Konto erstellen</h1>
          <p>In 1 Minute startklar für dein erstes RFP-Projekt.</p>
        </div>

        <form action={registerAction} className="grid auth-form">
          <label>
            <span>Name (optional)</span>
            <input name="name" placeholder="Max Mustermann" />
          </label>

          <label>
            <span>E-Mail-Adresse</span>
            <input name="email" type="email" placeholder="name@firma.de" required />
          </label>

          <label>
            <span>Passwort</span>
            <input name="password" type="password" placeholder="Mind. 6 Zeichen" required />
          </label>

          <button type="submit">Konto erstellen</button>
        </form>

        <p className="auth-foot">
          Schon registriert?
          <Link href="/login">Einloggen</Link>
        </p>
      </div>
    </div>
  );
}
