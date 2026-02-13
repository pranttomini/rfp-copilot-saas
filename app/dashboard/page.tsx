import Link from 'next/link';
import { createProjectAction } from '@/app/actions';
import { Nav } from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await prisma.project.findMany({ where: { ownerId: user.id }, orderBy: { updatedAt: 'desc' } });
  const totalRequirements = await prisma.projectRequirement.count({ where: { project: { ownerId: user.id } } });
  const totalDrafts = await prisma.projectRequirement.count({ where: { project: { ownerId: user.id }, draftAnswer: { not: null } } });
  const answerCount = await prisma.answer.count({ where: { ownerId: user.id } });

  return (
    <div className="container grid">
      <Nav />

      <div className="card hero-card">
        <h2>So funktioniert RFP Copilot</h2>
        <p className="small">In 3 einfachen Schritten zu deinem ersten Entwurf.</p>
        <div className="grid grid-3">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>Answer Library füllen</h4>
            <p className="small">Speichere Standardantworten (z. B. Security, DSGVO, SLA).</p>
            <Link className="inline-link" href="/dashboard/library">Zur Library →</Link>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h4>Projekt anlegen + RFP hochladen</h4>
            <p className="small">Lade .txt/.md hoch, wir extrahieren Anforderungen automatisch.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Entwürfe generieren + prüfen</h4>
            <p className="small">Für jede Anforderung wird ein erster Draft erzeugt.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Neues RFP-Projekt</h3>
          <form action={createProjectAction} className="grid">
            <input name="name" placeholder="Projektname (z. B. Ausschreibung Stadtwerke)" required />
            <textarea name="description" placeholder="Kurzbeschreibung (optional)" rows={3} />
            <button type="submit">Projekt erstellen</button>
          </form>
        </div>

        <div className="card">
          <h3>Übersicht</h3>
          <div className="metrics">
            <div className="metric"><span>{projects.length}</span><small>Projekte</small></div>
            <div className="metric"><span>{totalRequirements}</span><small>Anforderungen</small></div>
            <div className="metric"><span>{totalDrafts}</span><small>Drafts</small></div>
            <div className="metric"><span>{answerCount}</span><small>Library Einträge</small></div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Deine Projekte</h3>
        <table className="table">
          <thead><tr><th>Projekt</th><th>Status</th><th>Zuletzt aktualisiert</th></tr></thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/dashboard/projects/${p.id}`}>{p.name}</Link></td>
                <td><span className="badge">{p.status}</span></td>
                <td>{new Date(p.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
            {!projects.length && <tr><td colSpan={3}>Noch keine Projekte. Erstelle oben dein erstes Projekt.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
