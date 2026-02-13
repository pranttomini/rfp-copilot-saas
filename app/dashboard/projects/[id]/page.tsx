import Link from 'next/link';
import { generateDraftsAction, updateRequirementStatusAction, uploadRfpAction } from '@/app/actions';
import { Nav } from '@/components/Nav';
import { SubmitButton } from '@/components/SubmitButton';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function priorityClass(priority: string) {
  if (priority.toLowerCase().includes('high')) return 'bg-red-100 text-red-700';
  if (priority.toLowerCase().includes('low')) return 'bg-green-100 text-green-700';
  return 'bg-yellow-100 text-yellow-800';
}

function progressChip(label: string, value: number, tone: 'slate' | 'blue' | 'green' = 'slate') {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700'
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{label}: {value}</span>;
}

export default async function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, ownerId: user.id },
    include: { requirements: true }
  });

  if (!project) return <div className="max-w-4xl mx-auto p-8">Project not found</div>;

  const total = project.requirements.length;
  const drafted = project.requirements.filter((r) => r.status === 'DRAFTED').length;
  const reviewed = project.requirements.filter((r) => r.status === 'REVIEWED').length;
  const submitted = project.requirements.filter((r) => r.status === 'SUBMITTED').length;
  const doneCount = reviewed + submitted;
  const progressPercent = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Nav />
      </div>

      <main className="flex-1 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2 text-sm">
              <li><Link className="text-slate-500 hover:text-slate-700" href="/dashboard">Dashboard</Link></li>
              <li className="text-slate-300">/</li>
              <li className="text-primary font-medium">{project.name}</li>
            </ol>
          </nav>

          <section className="bg-surface-light rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900 mr-1">{project.name}</h1>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{project.status}</span>
              {progressChip('Anforderungen', total)}
              {progressChip('Drafted', drafted, 'blue')}
              {progressChip('Fertig', doneCount, 'green')}
            </div>
            <p className="text-sm text-slate-500">{project.description || 'Keine Beschreibung verfügbar'}</p>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Workflow-Fortschritt</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              <strong>Nächster Schritt:</strong>{' '}
              {total === 0
                ? 'RFP-Datei hochladen, damit Anforderungen extrahiert werden.'
                : drafted < total
                ? 'Drafts generieren und offene Anforderungen prüfen.'
                : submitted < total
                ? 'Status je Anforderung auf REVIEWED/SUBMITTED setzen.'
                : 'Alle Anforderungen bearbeitet – bereit für finale Abgabe.'}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-light overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 space-y-4">
                <h3 className="text-base font-semibold text-slate-900">1) RFP hochladen</h3>
                <p className="text-sm text-slate-500">Unterstützt: .txt, .md, .docx, .pdf (Basis-Extraktion mit Fallback).</p>
                <form action={uploadRfpAction} className="space-y-3">
                  <input type="hidden" name="projectId" value={project.id} />
                  <input name="file" type="file" accept=".txt,.md,.docx,.pdf,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required className="block w-full rounded-md border-slate-300 text-sm" />
                  <SubmitButton className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover" pendingText="Analysiere...">
                    Datei analysieren
                  </SubmitButton>
                </form>
              </div>
            </div>

            <div className="bg-surface-light overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 space-y-4">
                <h3 className="text-base font-semibold text-slate-900">2) Drafts erzeugen</h3>
                <p className="text-sm text-slate-500">Erstellt Entwürfe anhand Ihrer Answer Library für jede extrahierte Anforderung.</p>
                <form action={generateDraftsAction}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <SubmitButton className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50" pendingText="Generiere...">
                    Draft pro Anforderung generieren
                  </SubmitButton>
                </form>
              </div>
            </div>
          </div>

          {!project.requirements.length ? (
            <div className="bg-surface-light rounded-xl shadow-sm border border-slate-200 p-10 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="material-icons text-primary">upload_file</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Noch keine Anforderungen</h3>
              <p className="text-sm text-slate-500">Laden Sie eine RFP-Datei hoch, um den Workflow zu starten.</p>
            </div>
          ) : (
            <section className="bg-surface-light shadow-sm rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">3) Anforderungen bearbeiten</h3>
                <p className="text-sm text-slate-500">Status pflegen und Drafts finalisieren.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">Anforderung</th>
                      <th className="px-5 py-3 text-left font-medium">Deadline</th>
                      <th className="px-5 py-3 text-left font-medium">Priorität</th>
                      <th className="px-5 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {project.requirements.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 align-top">
                        <td className="px-5 py-4 text-sm text-slate-900 max-w-2xl">
                          <div className="font-medium">{r.title}</div>
                          <div className="text-xs text-slate-500 mt-1">{r.details}</div>
                          {r.draftAnswer && (
                            <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                              <summary className="cursor-pointer text-xs font-semibold uppercase text-slate-500">Draft anzeigen</summary>
                              <pre className="whitespace-pre-wrap text-xs text-slate-700 mt-2 mb-0">{r.draftAnswer}</pre>
                            </details>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">{r.deadline || '-'}</td>
                        <td className="px-5 py-4 text-sm">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${priorityClass(r.priority)}`}>{r.priority}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          <form action={updateRequirementStatusAction} className="flex items-center gap-2">
                            <input type="hidden" name="id" value={r.id} />
                            <select name="status" defaultValue={r.status} className="rounded-md border-slate-300 text-xs">
                              <option>TODO</option>
                              <option>DRAFTED</option>
                              <option>REVIEWED</option>
                              <option>SUBMITTED</option>
                            </select>
                            <SubmitButton className="px-2.5 py-1.5 text-xs rounded-md border border-slate-300 text-slate-700 bg-white hover:bg-slate-50" pendingText="...">
                              Speichern
                            </SubmitButton>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
