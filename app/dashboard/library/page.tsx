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
      <div className="card">
        <h3>Add answer snippet</h3>
        <form action={addAnswerAction} className="grid">
          <input name="questionKey" placeholder="Question key (e.g. gdpr-compliance)" required />
          <input name="title" placeholder="Title" required />
          <input name="tags" placeholder="Tags comma-separated" />
          <textarea name="body" rows={4} placeholder="Reusable answer text" required />
          <button type="submit">Save</button>
        </form>
      </div>

      <div className="card">
        <h3>Saved answers</h3>
        <table className="table">
          <thead><tr><th>Title</th><th>Tags</th><th></th></tr></thead>
          <tbody>
            {answers.map((a) => (
              <tr key={a.id}>
                <td><b>{a.title}</b><div className="small">{a.body}</div></td>
                <td>{a.tags}</td>
                <td>
                  <form action={deleteAnswerAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="secondary">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {!answers.length && <tr><td colSpan={3}>No answers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
