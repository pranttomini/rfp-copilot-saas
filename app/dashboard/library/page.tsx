import { addAnswerAction, deleteAnswerAction } from '@/app/actions';
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

      <main className="flex-grow py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Antwortbibliothek</h1>
          <p className="mt-2 text-sm text-slate-500">Verwalten Sie Ihre wiederkehrenden Textbausteine für effizientere Ausschreibungen.</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-4 relative z-10">
            <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg">
              <span className="material-icons text-primary text-2xl">library_books</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Zentrales Wissen</h3>
              <p className="text-slate-600 max-w-2xl leading-relaxed text-sm">
                Speichern Sie hier häufig verwendete Textbausteine. Das System nutzt diese Inhalte automatisch für Draft-Vorschläge in neuen Projekten.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 sticky top-24">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <span className="material-icons text-primary text-sm">add_circle</span>
                  Neuen Baustein hinzufügen
                </h2>
              </div>
              <form action={addAnswerAction} className="p-5 space-y-4">
                <input name="questionKey" placeholder="Schlüssel (z.B. dsgvo-compliance)" required className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                <input name="title" placeholder="Titel" required className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                <input name="tags" placeholder="Tags (Komma-getrennt)" className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                <textarea name="body" rows={6} placeholder="Antworttext" required className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                <SubmitButton className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover" pendingText="Speichere...">
                  Baustein speichern
                </SubmitButton>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm border border-slate-200 rounded-lg flex flex-col h-full min-h-[600px]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center gap-4">
                <form className="relative w-full sm:w-72" method="get">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-icons text-slate-400 text-sm">search</span>
                  </div>
                  <input name="q" defaultValue={q || ''} className="block w-full pl-10 sm:text-sm border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-primary focus:border-primary" placeholder="Bibliothek durchsuchen..." />
                </form>
                <div className="text-xs text-slate-500 whitespace-nowrap">{answers.length} Einträge</div>
              </div>

              <div className="overflow-x-auto flex-grow">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Baustein</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vorschau</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {answers.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-primary mb-1">{a.questionKey}</span>
                            <span className="text-sm font-medium text-slate-900">{a.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xl truncate">{a.body}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{a.tags || '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <form action={deleteAnswerAction}>
                            <input type="hidden" name="id" value={a.id} />
                            <SubmitButton className="inline-flex items-center px-3 py-1.5 text-xs rounded-md border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 bg-white" pendingText="...">
                              Löschen
                            </SubmitButton>
                          </form>
                        </td>
                      </tr>
                    ))}
                    {!answers.length && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                          Keine Treffer. Lege oben den ersten Baustein an.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
