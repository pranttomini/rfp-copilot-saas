import Link from 'next/link';
import { loginAction } from '@/app/actions';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <div className="auth-wrap">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📄</div>
          <span>RFP Copilot</span>
        </div>

        <div className="auth-head">
          <h1>Willkommen zurück</h1>
          <p>Bitte gib deine Daten ein, um fortzufahren.</p>
        </div>

        {params.error && <p className="auth-error">Ungültige Zugangsdaten</p>}

        <form action={loginAction} className="grid auth-form">
          <label>
            <span>E-Mail-Adresse</span>
            <input name="email" type="email" placeholder="name@firma.de" required />
          </label>

          <label>
            <span>Passwort</span>
            <input name="password" type="password" placeholder="••••••••••" required />
          </label>

          <button type="submit">Einloggen</button>
        </form>

        <p className="auth-foot">
          Noch kein Konto?
          <Link href="/register">Konto erstellen</Link>
        </p>

        <p className="auth-trust">Geschützt durch SSL 🔒</p>
      </div>
    </div>
  );
}
