import { addAnswerAction, deleteAnswerAction } from '@/app/actions';
import { Nav } from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function LibraryPage() {
  const user = await requireUser();
  const answers = await prisma.answer.findMany({ where: { ownerId: user.id }, orderBy: { updatedAt: 'desc' } });

  return (
    <div className="container grid">
      <Nav />

      <div className="card hero-card">
        <h2>Antwortbibliothek</h2>
        <p className="small">Verwalte wiederkehrende Textbausteine. Diese werden beim Drafting automatisch vorgeschlagen.</p>
      </div>

      <div className="grid lib-layout">
        <aside className="card" style={{ position: 'sticky', top: 90 }}>
          <h3>Neuen Baustein hinzufügen</h3>
          <form action={addAnswerAction} className="grid">
            <input name="questionKey" placeholder="Schlüssel (z. B. dsgvo-compliance)" required />
            <input name="title" placeholder="Titel" required />
            <input name="tags" placeholder="Tags (Komma-getrennt)" />
            <textarea name="body" rows={6} placeholder="Antworttext" required />
            <button type="submit">Baustein speichern</button>
          </form>
        </aside>

        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
            <h3>Gespeicherte Bausteine</h3>
            <input placeholder="Durchsuchen..." style={{ maxWidth: 220 }} readOnly />
          </div>

          <table className="table">
            <thead><tr><th>Titel</th><th>Tags</th><th></th></tr></thead>
            <tbody>
              {answers.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{a.title}</div>
                    <div className="small" style={{ marginTop: 5 }}>{a.body}</div>
                  </td>
                  <td>{a.tags || '-'}</td>
                  <td>
                    <form action={deleteAnswerAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <button className="secondary">Löschen</button>
                    </form>
                  </td>
                </tr>
              ))}
              {!answers.length && <tr><td colSpan={3}>Noch keine Bausteine gespeichert.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
