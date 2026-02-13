import Link from 'next/link';
import { createProjectAction } from '@/app/actions';
import { Nav } from '@/components/Nav';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await prisma.project.findMany({ where: { ownerId: user.id }, orderBy: { updatedAt: 'desc' } });
  const totalRequirements = await prisma.projectRequirement.count({ where: { project: { ownerId: user.id } } });

  return (
    <div className="container grid">
      <Nav />
      <div className="grid grid-2">
        <div className="card">
          <h3>Create Project</h3>
          <form action={createProjectAction} className="grid">
            <input name="name" placeholder="Project name" required />
            <textarea name="description" placeholder="Description" rows={3} />
            <button type="submit">Create</button>
          </form>
        </div>
        <div className="card">
          <h3>Overview</h3>
          <p><b>{projects.length}</b> projects</p>
          <p><b>{totalRequirements}</b> extracted requirements</p>
        </div>
      </div>

      <div className="card">
        <h3>Your Projects</h3>
        <table className="table">
          <thead><tr><th>Name</th><th>Status</th><th>Updated</th></tr></thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/dashboard/projects/${p.id}`}>{p.name}</Link></td>
                <td><span className="badge">{p.status}</span></td>
                <td>{new Date(p.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
            {!projects.length && <tr><td colSpan={3}>No projects yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
