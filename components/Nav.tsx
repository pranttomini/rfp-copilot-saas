import Link from 'next/link';
import { logoutAction } from '@/app/actions';

export function Nav() {
  return (
    <nav className="top-nav">
      <div className="top-nav-inner">
        <div className="top-nav-left">
          <Link href="/dashboard" className="brand-link">
            <span className="brand-icon">✨</span>
            <span className="brand-text">RFP Copilot</span>
          </Link>

          <div className="top-nav-menu">
            <Link href="/dashboard" className="menu-item">Dashboard</Link>
            <Link href="/dashboard/library" className="menu-item">Answer Library</Link>
          </div>
        </div>

        <div className="top-nav-right">
          <div className="user-chip">
            <span className="user-avatar">TM</span>
          </div>
          <form action={logoutAction}>
            <button className="secondary">Logout</button>
          </form>
        </div>
      </div>
    </nav>
  );
}
