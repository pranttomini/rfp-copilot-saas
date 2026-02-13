import Link from 'next/link';
import { loginAction } from '@/app/actions';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <div className="card">
        <h2>Sign in</h2>
        {params.error && <p style={{ color: 'crimson' }}>Invalid credentials</p>}
        <form action={loginAction} className="grid">
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
        <p className="small">Demo: demo@rfpcopilot.local / demo1234</p>
        <p className="small">No account? <Link href="/register">Create one</Link></p>
      </div>
    </div>
  );
}
