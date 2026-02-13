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

export default async function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, ownerId: user.id },
    include: { requirements: true }
  });

  if (!project) return <div className="max-w-4xl mx-auto p-8">Project not found</div>;

  const draftedCount = project.requirements.filter((r) => !!r.draftAnswer).length;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Nav />
      </div>

      <main className="flex-1 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2 text-sm">
              <li><Link className="text-slate-500 hover:text-slate-700" href="/dashboard">Dashboard</Link></li>
              <li className="text-slate-300">/</li>
              <li className="text-primary font-medium">{project.name}</li>
            </ol>
          </nav>

          <div className="md:flex md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{project.name}</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{project.status}</span>
              </div>
              <p className="text-sm text-slate-500">{project.description || 'Keine Beschreibung verfügbar'}</p>
              <p className="text-xs text-slate-400 mt-2">Anforderungen: {project.requirements.length} · Drafts: {draftedCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-light overflow-hidden rounded-lg shadow ring-1 ring-slate-900/5">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="material-icons text-2xl">upload_file</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">RFP hochladen</h3>
                    <p className="text-sm text-slate-500">Importieren Sie Ihre Ausschreibungsunterlagen (.txt, .md).</p>
                  </div>
                </div>
                <form action={uploadRfpAction} className="mt-6 space-y-3 border-t border-slate-100 pt-4">
                  <input type="hidden" name="projectId" value={project.id} />
                  <input name="file" type="file" accept=".txt,.md,text/plain,text/markdown" required className="block w-full rounded-md border-slate-300 text-sm" />
                  <SubmitButton className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover" pendingText="Analysiere...">
                    Datei analysieren
                  </SubmitButton>
                </form>
              </div>
            </div>

            <div className="bg-surface-light overflow-hidden rounded-lg shadow ring-1 ring-slate-900/5">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <span className="material-icons text-2xl">auto_awesome</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">Drafts generieren</h3>
                    <p className="text-sm text-slate-500">KI-gestützt basierend auf Ihrer Antwortbibliothek.</p>
                  </div>
                </div>
                <form action={generateDraftsAction} className="mt-6 space-y-3 border-t border-slate-100 pt-4">
                  <input type="hidden" name="projectId" value={project.id} />
                  <SubmitButton className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50" pendingText="Generiere...">
                    Draft pro Anforderung generieren
                  </SubmitButton>
                </form>
              </div>
            </div>
          </div>

          {!project.requirements.length ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="mx-auto w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                <span className="material-icons text-primary">add</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Noch keine Anforderungen</h3>
              <p className="text-sm text-gray-500">Laden Sie eine RFP-Datei hoch, damit wir automatisch Anforderungen extrahieren können.</p>
            </div>
          ) : (
            <div className="bg-surface-light shadow rounded-lg ring-1 ring-slate-900/5 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-900">Anforderungskatalog</h3>
                <p className="text-sm text-slate-500">Verwalten und beantworten Sie die spezifischen Anforderungen.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Anforderung</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priorität</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {project.requirements.map((r) => (
                      <tr key={r.id}>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          <div className="font-medium">{r.title}</div>
                          <div className="text-xs text-slate-500 mt-1">{r.details}</div>
                          {r.draftAnswer && (
                            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                              <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Draft</div>
                              <pre className="whitespace-pre-wrap text-xs text-slate-700 m-0">{r.draftAnswer}</pre>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{r.deadline || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${priorityClass(r.priority)}`}>{r.priority}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
