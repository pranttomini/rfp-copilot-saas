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

  return (
    <div className="container grid">
      <Nav />
      <div className="card">
        <h2>{project.name}</h2>
        <p>{project.description}</p>
        <p>Status: <span className="badge">{project.status}</span></p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Upload RFP (.txt/.md)</h3>
          <form action={uploadRfpAction} className="grid">
            <input type="hidden" name="projectId" value={project.id} />
            <input name="file" type="file" accept=".txt,.md,text/plain,text/markdown" required />
            <button type="submit">Parse Requirements</button>
          </form>
        </div>
        <div className="card">
          <h3>Generate first drafts</h3>
          <form action={generateDraftsAction}>
            <input type="hidden" name="projectId" value={project.id} />
            <button type="submit">Generate Draft per Requirement</button>
          </form>
          <p className="small">Uses answer library snippets + template.</p>
        </div>
      </div>

      <div className="card">
        <h3>Parsed Requirements ({project.requirements.length})</h3>
        <table className="table">
          <thead><tr><th>Requirement</th><th>Deadline</th><th>Priority</th><th>Status</th></tr></thead>
          <tbody>
            {project.requirements.map((r) => (
              <tr key={r.id}>
                <td>
                  <b>{r.title}</b>
                  <div>{r.details}</div>
                  {r.draftAnswer && <pre style={{ whiteSpace: 'pre-wrap', background: '#f8fafc', padding: 10, borderRadius: 8 }}>{r.draftAnswer}</pre>}
                </td>
                <td>{r.deadline || '-'}</td>
                <td><span className="badge">{r.priority}</span></td>
                <td>
                  <form action={updateRequirementStatusAction} className="grid">
                    <input type="hidden" name="id" value={r.id} />
                    <select name="status" defaultValue={r.status}>
                      <option>TODO</option><option>DRAFTED</option><option>REVIEWED</option><option>SUBMITTED</option>
                    </select>
                    <button className="secondary">Update</button>
                  </form>
                </td>
              </tr>
            ))}
            {!project.requirements.length && <tr><td colSpan={4}>Upload an RFP to extract requirements.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
