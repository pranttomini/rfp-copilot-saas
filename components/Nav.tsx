'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/actions';

function itemClass(active: boolean) {
  return active
    ? 'border-b-2 border-primary text-primary px-3 py-5 text-sm font-medium'
    : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700 px-3 py-5 text-sm font-medium transition-colors';
}

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-surface-light/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-2 cursor-pointer" prefetch={false}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <span className="material-icons text-xl">auto_awesome</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">RFP Copilot</span>
            </Link>
            <div className="hidden md:flex md:space-x-1">
              <Link className={itemClass(pathname === '/dashboard')} href="/dashboard" prefetch={false}>Dashboard</Link>
              <Link className={itemClass(pathname.startsWith('/dashboard/projects'))} href="/dashboard/projects" prefetch={false}>Projekte</Link>
              <Link className={itemClass(pathname.startsWith('/dashboard/library'))} href="/dashboard/library" prefetch={false}>Answer Library</Link>
            </div>
          </div>
          <div className="flex items-center gap-3 pl-4">
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 text-xs font-semibold text-slate-600">TM</div>
            <form action={logoutAction}>
              <button className="px-4 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200">Logout</button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
