import Link from 'next/link';
import { createProjectAction } from '@/app/actions';
import { Nav } from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function statusClass(status: string) {
  if (status === 'TODO') return 's-todo';
  if (status === 'DRAFTED') return 's-drafted';
  if (status === 'REVIEWED') return 's-reviewed';
  if (status === 'SUBMITTED') return 's-submitted';
  return 's-default';
}

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await prisma.project.findMany({
    where: { ownerId: user.id },
    include: { requirements: true },
    orderBy: { updatedAt: 'desc' }
  });

  const totalRequirements = projects.reduce((acc, p) => acc + p.requirements.length, 0);
  const totalDrafts = projects.reduce((acc, p) => acc + p.requirements.filter((r) => !!r.draftAnswer).length, 0);
  const answerCount = await prisma.answer.count({ where: { ownerId: user.id } });

  return (
    <div className="container grid">
      <Nav />

      <section className="card hero-card">
        <h2>So funktioniert RFP Copilot in 3 Schritten</h2>
        <p className="small">Ihr persönlicher Assistent für effizientes Ausschreibungsmanagement.</p>
        <div className="grid grid-3">
          <article className="step-card fancy">
            <div className="step-number">1</div>
            <h4>Answer Library füllen</h4>
            <p className="small">Speichere Standardantworten für Security, DSGVO, SLA und mehr.</p>
            <Link className="inline-link" href="/dashboard/library">Zur Bibliothek →</Link>
          </article>
          <article className="step-card fancy">
            <div className="step-number">2</div>
            <h4>Projekt anlegen</h4>
            <p className="small">Lade neue RFP-Dateien hoch und extrahiere Anforderungen automatisch.</p>
          </article>
          <article className="step-card fancy">
            <div className="step-number">3</div>
            <h4>Entwürfe generieren</h4>
            <p className="small">Erhalte Drafts auf Basis deiner Library – pro Anforderung.</p>
          </article>
        </div>
      </section>

      <section className="grid grid-2">
        <div className="card">
          <h3>Neues Projekt</h3>
          <form action={createProjectAction} className="grid">
            <input name="name" placeholder="Projektname (z. B. Stadtwerke Berlin 2026)" required />
            <textarea name="description" placeholder="Kurzbeschreibung (optional)" rows={3} />
            <button type="submit">Projekt erstellen</button>
          </form>
        </div>

        <div className="grid grid-2">
          <div className="metric-card"><small>Aktive Projekte</small><strong>{projects.length}</strong></div>
          <div className="metric-card"><small>Anforderungen</small><strong>{totalRequirements}</strong></div>
          <div className="metric-card"><small>Drafts generiert</small><strong>{totalDrafts}</strong></div>
          <div className="metric-card"><small>Library Einträge</small><strong>{answerCount}</strong></div>
        </div>
      </section>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <h3>Aktuelle Projekte</h3>
            <p className="small">Verwalte und verfolge laufende Ausschreibungen.</p>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Projekt</th>
              <th>Status</th>
              <th>Fortschritt</th>
              <th>Zuletzt aktualisiert</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const total = p.requirements.length;
              const done = p.requirements.filter((r) => r.status === 'REVIEWED' || r.status === 'SUBMITTED').length;
              const percent = total ? Math.round((done / total) * 100) : 0;
              return (
                <tr key={p.id}>
                  <td>
                    <Link href={`/dashboard/projects/${p.id}`}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span className="avatar">{initials(p.name)}</span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div className="small">{p.description || 'Ohne Beschreibung'}</div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td><span className={`badge ${statusClass(p.status)}`}>{p.status}</span></td>
                  <td style={{ minWidth: 190 }}>
                    <div className="progress"><span style={{ width: `${percent}%` }} /></div>
                    <span className="small">{done}/{total || 0} erledigt</span>
                  </td>
                  <td>{new Date(p.updatedAt).toLocaleString()}</td>
                </tr>
              );
            })}
            {!projects.length && <tr><td colSpan={4}>Noch keine Projekte. Lege oben dein erstes Projekt an.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
