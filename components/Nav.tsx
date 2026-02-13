import Link from 'next/link';
import { logoutAction } from '@/app/actions';

export function Nav() {
  return (
    <div className="nav">
      <div style={{ display: 'flex', gap: 14 }}>
        <Link href="/dashboard"><b>RFP Copilot</b></Link>
        <Link href="/dashboard/library">Answer Library</Link>
      </div>
      <form action={logoutAction}>
        <button className="secondary">Logout</button>
      </form>
    </div>
  );
}
