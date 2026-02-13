import Link from 'next/link';
import { registerAction } from '@/app/actions';

export default function RegisterPage() {
  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <div className="card">
        <h2>Create account</h2>
        <form action={registerAction} className="grid">
          <input name="name" placeholder="Name (optional)" />
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password (min 6 chars)" required />
          <button type="submit">Register</button>
        </form>
        <p className="small">Have an account? <Link href="/login">Login</Link></p>
      </div>
    </div>
  );
}
