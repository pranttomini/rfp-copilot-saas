import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await prisma.project.findMany({
    where: { ownerId: user.id },
    include: { requirements: true },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Nav />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-6">
        <section className="bg-surface-light rounded-xl border border-slate-200 p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Projekte</h1>
          <p className="text-slate-500 mt-1">Alle Ausschreibungsprojekte im Überblick.</p>
        </section>

        <section className="bg-surface-light rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-medium">
                <th className="px-6 py-4">Projekt</th>
                <th className="px-6 py-4">Anforderungen</th>
                <th className="px-6 py-4">Zuletzt aktualisiert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/projects/${p.id}`} className="font-medium text-slate-900 hover:text-primary">
                      {p.name}
                    </Link>
                    <div className="text-xs text-slate-500 mt-1">{p.description || 'Ohne Beschreibung'}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{p.requirements.length}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(p.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
              {!projects.length && (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-sm text-slate-500">Noch keine Projekte vorhanden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
