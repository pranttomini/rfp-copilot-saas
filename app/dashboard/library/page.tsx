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
        <h2>Answer Library</h2>
        <p className="small">Hier hinterlegst du wiederverwendbare Standardantworten (z. B. DSGVO, Security, SLA). Diese werden beim Draft-Generator automatisch genutzt.</p>
      </div>

      <div className="card">
        <h3>Neuen Baustein speichern</h3>
        <form action={addAnswerAction} className="grid">
          <input name="questionKey" placeholder="Schlüssel (z. B. dsgvo-compliance)" required />
          <input name="title" placeholder="Titel (z. B. Datenschutzkonzept)" required />
          <input name="tags" placeholder="Tags, durch Komma getrennt" />
          <textarea name="body" rows={5} placeholder="Antworttext" required />
          <button type="submit">Baustein speichern</button>
        </form>
      </div>

      <div className="card">
        <h3>Gespeicherte Bausteine</h3>
        <table className="table">
          <thead><tr><th>Titel</th><th>Tags</th><th></th></tr></thead>
          <tbody>
            {answers.map((a) => (
              <tr key={a.id}>
                <td>
                  <b>{a.title}</b>
                  <div className="small" style={{ marginTop: 6 }}>{a.body}</div>
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
      </div>
    </div>
  );
}
