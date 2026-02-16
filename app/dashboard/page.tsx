import Link from 'next/link';
import { createProjectAction } from '@/app/actions';
import { Nav } from '@/components/Nav';
import { SubmitButton } from '@/components/SubmitButton';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { statusClasses } from '@/lib/status';
import { formatDateTime } from '@/lib/formatDate';

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ toast?: string; message?: string }>;
}) {
  const user = await requireUser();
  const { toast, message } = await searchParams;
  const projects = await prisma.project.findMany({
    where: { ownerId: user.id },
    include: { requirements: true },
    orderBy: { updatedAt: 'desc' }
  });

  const totalRequirements = projects.reduce((acc, p) => acc + p.requirements.length, 0);
  const totalDrafts = projects.reduce((acc, p) => acc + p.requirements.filter((r) => !!r.draftAnswer).length, 0);
  const answerCount = await prisma.answer.count({ where: { ownerId: user.id } });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Nav />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {message && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              toast === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <section className="bg-surface-light rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-slate-900">So funktioniert RFP Copilot in 3 Schritten</h1>
            <p className="text-slate-500 mt-1">Ihr persönlicher Assistent für effizientes Ausschreibungsmanagement.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              ['1', 'library_books', 'Answer Library füllen', 'Lade vergangene Ausschreibungen und Unternehmensdaten hoch, um die Wissensbasis zu trainieren.'],
              ['2', 'create_new_folder', 'Projekt anlegen', 'Importiere neue RFP-Dokumente. Die KI extrahiert automatisch alle Anforderungen.'],
              ['3', 'auto_fix_high', 'Entwürfe generieren', 'Lassen Sie sich passende Antwortvorschläge basierend auf Ihrer Library erstellen.']
            ].map((step) => (
              <div key={step[0]} className="relative group p-5 rounded-lg border border-slate-100 bg-slate-50 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                <div className="absolute top-5 right-5 text-slate-200 text-6xl font-bold opacity-20 select-none">{step[0]}</div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <span className="material-icons">{step[1]}</span>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">{step[2]}</h3>
                <p className="text-sm text-slate-500">{step[3]}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['Aktive Projekte', 'folder_open', String(projects.length)],
            ['Anforderungen', 'list_alt', String(totalRequirements)],
            ['Drafts generiert', 'edit_note', String(totalDrafts)],
            ['Library Einträge', 'storage', String(answerCount)]
          ].map((metric) => (
            <div key={metric[0]} className="bg-surface-light p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 hover:border-primary/40 transition-colors">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-500">{metric[0]}</p>
                <span className="material-icons text-primary/60 text-xl">{metric[1]}</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{metric[2]}</p>
            </div>
          ))}
        </div>

        <section className="bg-surface-light rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Aktuelle Projekte</h2>
              <p className="text-sm text-slate-500">Verwalten und verfolgen Sie Ihre laufenden Ausschreibungen.</p>
            </div>
            <form action={createProjectAction} className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <input name="name" placeholder="Projektname" required className="w-full sm:w-64 rounded-lg border-slate-300" />
              <SubmitButton className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm w-full sm:w-auto" pendingText="Erstelle...">
                Projekt erstellen
              </SubmitButton>
            </form>
          </div>

          {!projects.length ? (
            <div className="p-10 text-center">
              <div className="mx-auto w-40 h-40 bg-primary/5 rounded-full flex items-center justify-center mb-5 relative overflow-hidden">
                <div className="w-24 h-28 bg-white rounded-lg shadow border border-slate-100 -rotate-6 absolute" />
                <div className="w-24 h-28 bg-primary/10 rounded-lg border border-primary/20 rotate-6 absolute" />
                <div className="w-10 h-10 bg-primary rounded-full text-white flex items-center justify-center z-10">
                  <span className="material-icons">add</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Noch keine Projekte</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Starten Sie Ihr erstes Ausschreibungsverfahren, um Angebote zu vergleichen und den besten Partner zu finden.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-medium">
                    <th className="px-6 py-4">Projekt</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Fortschritt</th>
                    <th className="px-6 py-4 text-right">Zuletzt aktualisiert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {projects.map((p) => {
                    const total = p.requirements.length;
                    const done = p.requirements.filter((r) => r.status === 'REVIEWED' || r.status === 'SUBMITTED').length;
                    const percent = total ? Math.round((done / total) * 100) : 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/projects/${p.id}`} className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{initials(p.name)}</div>
                            <div>
                              <div className="font-medium text-slate-900">{p.name}</div>
                              <div className="text-xs text-slate-500">{p.description || 'Ohne Beschreibung'}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses(p.status)}`}>{p.status}</span>
                        </td>
                        <td className="px-6 py-4 w-48">
                          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-xs text-slate-500">{done}/{total || 0} Aufgaben</span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-slate-500">{formatDateTime(p.updatedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
