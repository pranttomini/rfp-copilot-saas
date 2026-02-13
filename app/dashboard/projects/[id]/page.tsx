import { generateDraftsAction, updateRequirementStatusAction, uploadRfpAction } from '@/app/actions';
import { Nav } from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, ownerId: user.id },
    include: { requirements: true }
  });

  if (!project) return <div className="container">Project not found</div>;

  const draftedCount = project.requirements.filter((r) => !!r.draftAnswer).length;

  return (
    <div className="container grid">
      <Nav />

      <div className="card">
        <h2>{project.name}</h2>
        <p className="small">{project.description || 'Keine Beschreibung'}</p>
        <p className="small">Status: <span className="badge">{project.status}</span> · Anforderungen: <b>{project.requirements.length}</b> · Drafts: <b>{draftedCount}</b></p>
      </div>

      <div className="card hero-card">
        <h3>Schnellstart für dieses Projekt</h3>
        <div className="grid grid-3">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>RFP hochladen</h4>
            <p className="small">Datei im Format .txt oder .md.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h4>Anforderungen prüfen</h4>
            <p className="small">Nach Upload siehst du alle erkannten Anforderungen unten.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Entwürfe generieren</h4>
            <p className="small">Erstellt für jede Anforderung einen ersten Antworttext.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>1) RFP hochladen (.txt/.md)</h3>
          <form action={uploadRfpAction} className="grid">
            <input type="hidden" name="projectId" value={project.id} />
            <input name="file" type="file" accept=".txt,.md,text/plain,text/markdown" required />
            <button type="submit">Datei analysieren</button>
          </form>
        </div>

        <div className="card">
          <h3>2) Drafts erstellen</h3>
          <form action={generateDraftsAction} className="grid">
            <input type="hidden" name="projectId" value={project.id} />
            <button type="submit">Draft pro Anforderung generieren</button>
          </form>
          <p className="small">Nutzen: kombiniert Library-Bausteine + Template.</p>
        </div>
      </div>

      <div className="card">
        <h3>Erkannte Anforderungen ({project.requirements.length})</h3>
        <table className="table">
          <thead><tr><th>Anforderung</th><th>Deadline</th><th>Priorität</th><th>Status</th></tr></thead>
          <tbody>
            {project.requirements.map((r) => (
              <tr key={r.id}>
                <td>
                  <b>{r.title}</b>
                  <div className="small" style={{ marginTop: 6 }}>{r.details}</div>
                  {r.draftAnswer && (
                    <div className="draft-box">
                      <div className="small"><b>Draft:</b></div>
                      <pre>{r.draftAnswer}</pre>
                    </div>
                  )}
                </td>
                <td>{r.deadline || '-'}</td>
                <td><span className="badge">{r.priority}</span></td>
                <td>
                  <form action={updateRequirementStatusAction} className="grid">
                    <input type="hidden" name="id" value={r.id} />
                    <select name="status" defaultValue={r.status}>
                      <option>TODO</option>
                      <option>DRAFTED</option>
                      <option>REVIEWED</option>
                      <option>SUBMITTED</option>
                    </select>
                    <button className="secondary">Status speichern</button>
                  </form>
                </td>
              </tr>
            ))}
            {!project.requirements.length && <tr><td colSpan={4}>Noch keine Anforderungen. Lade zuerst eine RFP-Datei hoch.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
