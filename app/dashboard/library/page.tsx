import { addAnswerAction, deleteAnswerAction, updateAnswerAction } from '@/app/actions';
import { Nav } from '@/components/Nav';
import { SubmitButton } from '@/components/SubmitButton';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function LibraryPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireUser();
  const { q } = await searchParams;

  const answers = await prisma.answer.findMany({
    where: {
      ownerId: user.id,
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { body: { contains: q } },
              { tags: { contains: q } },
              { questionKey: { contains: q } }
            ]
          }
        : {})
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Nav />
      </div>

      <main className="flex-grow py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <section className="bg-surface-light rounded-xl border border-slate-200 p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Answer Library</h1>
          <p className="mt-1 text-sm text-slate-500">Textbausteine erstellen, durchsuchen, aktualisieren und löschen.</p>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <aside className="xl:col-span-1">
            <div className="bg-surface-light rounded-xl shadow-sm border border-slate-200 sticky top-24">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900">Neuen Baustein anlegen</h2>
              </div>
              <form action={addAnswerAction} className="p-5 space-y-3">
                <input name="questionKey" placeholder="Schlüssel (z.B. dsgvo-compliance)" required className="block w-full rounded-lg border-slate-300 text-sm" />
                <input name="title" placeholder="Titel" required className="block w-full rounded-lg border-slate-300 text-sm" />
                <input name="tags" placeholder="Tags (Komma-getrennt)" className="block w-full rounded-lg border-slate-300 text-sm" />
                <textarea name="body" rows={6} placeholder="Antworttext" required className="block w-full rounded-lg border-slate-300 text-sm" />
                <SubmitButton className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover" pendingText="Speichere...">
                  Erstellen
                </SubmitButton>
              </form>
            </div>
          </aside>

          <section className="xl:col-span-2 bg-surface-light shadow-sm border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center gap-4">
              <form className="relative w-full sm:w-80" method="get">
                <span className="material-icons text-slate-400 text-sm absolute left-3 top-2.5">search</span>
                <input name="q" defaultValue={q || ''} className="block w-full pl-10 text-sm border-slate-200 rounded-lg bg-slate-50 focus:bg-white" placeholder="Bibliothek durchsuchen..." />
              </form>
              <div className="text-xs text-slate-500 whitespace-nowrap">{answers.length} Einträge</div>
            </div>

            {!answers.length ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <span className="material-icons">library_books</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900">Noch keine Treffer</h3>
                <p className="text-sm text-slate-500 mt-1">Lege links einen ersten Baustein an oder passe den Suchbegriff an.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Baustein</th>
                      <th className="px-4 py-3 text-left font-medium">Inhalt</th>
                      <th className="px-4 py-3 text-left font-medium">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {answers.map((a) => (
                      <tr key={a.id} className="align-top hover:bg-slate-50/70">
                        <td colSpan={2} className="px-4 py-4 min-w-[580px]">
                          <form action={updateAnswerAction} className="space-y-2">
                            <input type="hidden" name="id" value={a.id} />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <input name="questionKey" defaultValue={a.questionKey} required className="rounded-md border-slate-300 text-xs font-medium text-primary" />
                              <input name="title" defaultValue={a.title} required className="rounded-md border-slate-300 text-sm font-medium md:col-span-2" />
                            </div>
                            <input name="tags" defaultValue={a.tags} placeholder="Tags" className="w-full rounded-md border-slate-300 text-xs" />
                            <textarea name="body" defaultValue={a.body} rows={5} className="w-full rounded-md border-slate-300 text-sm" />
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-xs text-slate-400">Zuletzt aktualisiert: {new Date(a.updatedAt).toLocaleString('de-DE')}</div>
                              <SubmitButton className="inline-flex items-center px-3 py-1.5 text-xs rounded-md bg-primary text-white hover:bg-primary-hover" pendingText="...">Aktualisieren</SubmitButton>
                            </div>
                          </form>
                        </td>
                        <td className="px-4 py-4 w-32">
                          <form action={deleteAnswerAction}>
                            <input type="hidden" name="id" value={a.id} />
                            <SubmitButton className="inline-flex items-center px-3 py-1.5 text-xs rounded-md border border-red-200 text-red-600 hover:bg-red-50" pendingText="...">
                              Löschen
                            </SubmitButton>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
