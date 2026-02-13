import Link from 'next/link';
import { loginAction } from '@/app/actions';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ toast?: string; message?: string }> }) {
  const params = await searchParams;

  return (
    <div className="auth-wrap">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><span className="material-icons text-[20px]">description</span></div>
          <span className="text-xl font-bold tracking-tight text-slate-900">RFP Copilot</span>
        </div>

        <div className="auth-head">
          <h1>Willkommen zurück</h1>
          <p>Bitte geben Sie Ihre Daten ein, um fortzufahren.</p>
        </div>

        {params.toast === 'error' && params.message && <p className="auth-error">{params.message}</p>}

        <form action={loginAction} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">E-Mail-Adresse</label>
            <div className="auth-input-wrap">
              <span className="material-icons">mail_outline</span>
              <input id="email" name="email" type="email" placeholder="name@firma.de" required />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="password">Passwort</label>
            <div className="auth-input-wrap">
              <span className="material-icons">lock_outline</span>
              <input id="password" name="password" type="password" placeholder="••••••••••" required />
            </div>
          </div>

          <button type="submit">Einloggen</button>
        </form>

        <p className="auth-foot">
          Noch kein Konto?
          <Link href="/register">Konto erstellen</Link>
        </p>

        <p className="auth-trust">
          Geschützt durch SSL
          <span className="material-icons text-[12px]">lock</span>
        </p>
      </div>
    </div>
  );
}
