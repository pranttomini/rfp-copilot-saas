export function statusClasses(status: string) {
  if (status === 'TODO' || status === 'Intake') return 'bg-yellow-100 text-yellow-800';
  if (status === 'DRAFTED' || status === 'Drafting') return 'bg-blue-100 text-blue-800';
  if (status === 'REVIEWED' || status === 'Parsed') return 'bg-green-100 text-green-800';
  if (status === 'SUBMITTED') return 'bg-indigo-100 text-indigo-800';
  return 'bg-slate-100 text-slate-700';
}
