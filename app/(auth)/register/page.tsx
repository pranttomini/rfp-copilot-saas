import Link from 'next/link';
import { registerAction } from '@/app/actions';

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ toast?: string; message?: string }> }) {
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
          <h1>Konto erstellen</h1>
          <p>In 1 Minute startklar für dein erstes RFP-Projekt.</p>
        </div>

        {params.toast === 'error' && params.message && <p className="auth-error">{params.message}</p>}

        <form action={registerAction} className="auth-form">
          <div className="auth-field">
            <label htmlFor="name">Name (optional)</label>
            <div className="auth-input-wrap">
              <span className="material-icons">person_outline</span>
              <input id="name" name="name" placeholder="Max Mustermann" />
            </div>
          </div>

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
              <input id="password" name="password" type="password" placeholder="Mind. 6 Zeichen" required />
            </div>
          </div>

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
