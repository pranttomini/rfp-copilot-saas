'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { clearSession, login, register, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateDraft, parseRfpText } from '@/lib/rfp-parser';

export async function registerAction(formData: FormData) {
  const schema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() });
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name') || undefined
  });

  if (!parsed.success) redirect('/register?error=invalid');

  await register(parsed.data.email, parsed.data.password, parsed.data.name);
  redirect('/dashboard');
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const user = await login(email, password);
  if (!user) redirect('/login?error=invalid');
  redirect('/dashboard');
}

export async function logoutAction() {
  await clearSession();
  redirect('/login');
}

export async function createProjectAction(formData: FormData) {
  const user = await requireUser();
  const schema = z.object({ name: z.string().trim().min(2).max(120), description: z.string().trim().max(400).optional() });
  const parsed = schema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined
  });

  if (!parsed.success) {
    revalidatePath('/dashboard');
    return;
  }

  await prisma.project.create({ data: { name: parsed.data.name, description: parsed.data.description, ownerId: user.id } });
  revalidatePath('/dashboard');
}

export async function addAnswerAction(formData: FormData) {
  const user = await requireUser();
  const schema = z.object({
    questionKey: z.string().trim().min(2),
    title: z.string().trim().min(2),
    body: z.string().trim().min(10),
    tags: z.string().trim().optional()
  });
  const parsed = schema.safeParse({
    questionKey: formData.get('questionKey'),
    title: formData.get('title'),
    body: formData.get('body'),
    tags: formData.get('tags') || undefined
  });

  if (!parsed.success) {
    revalidatePath('/dashboard/library');
    return;
  }

  await prisma.answer.create({
    data: {
      ownerId: user.id,
      questionKey: parsed.data.questionKey,
      title: parsed.data.title,
      body: parsed.data.body,
      tags: parsed.data.tags || ''
    }
  });
  revalidatePath('/dashboard/library');
}

export async function deleteAnswerAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get('id'));
  await prisma.answer.deleteMany({ where: { id, ownerId: user.id } });
  revalidatePath('/dashboard/library');
}

export async function uploadRfpAction(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get('projectId'));
  const file = formData.get('file') as File | null;
  if (!file || !file.name) return;

  const allowed = file.name.endsWith('.md') || file.name.endsWith('.txt') || ['text/plain', 'text/markdown', 'application/octet-stream'].includes(file.type);
  if (!allowed) throw new Error('Only .txt/.md supported in MVP');

  const text = await file.text();
  const parsed = parseRfpText(text);

  await prisma.project.updateMany({ where: { id: projectId, ownerId: user.id }, data: { rfpRawText: text, status: 'Parsed' } });
  await prisma.projectRequirement.deleteMany({ where: { projectId, project: { ownerId: user.id } } });
  if (parsed.length) {
    await prisma.projectRequirement.createMany({
      data: parsed.map((p) => ({
        projectId,
        title: p.title,
        details: p.details,
        deadline: p.deadline,
        priority: p.priority,
        status: 'TODO'
      }))
    });
  }
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function generateDraftsAction(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get('projectId'));

  const [requirements, answers] = await Promise.all([
    prisma.projectRequirement.findMany({ where: { projectId, project: { ownerId: user.id } }, orderBy: { title: 'asc' } }),
    prisma.answer.findMany({ where: { ownerId: user.id } })
  ]);

  for (const req of requirements) {
    const draft = generateDraft(req.details, answers);
    await prisma.projectRequirement.update({
      where: { id: req.id },
      data: { draftAnswer: draft, status: 'DRAFTED' }
    });
  }

  await prisma.project.updateMany({ where: { id: projectId, ownerId: user.id }, data: { status: 'Drafting' } });
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function updateRequirementStatusAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get('id'));
  const status = String(formData.get('status'));
  if (!['TODO', 'DRAFTED', 'REVIEWED', 'SUBMITTED'].includes(status)) return;

  await prisma.projectRequirement.updateMany({
    where: { id, project: { ownerId: user.id } },
    data: { status }
  });

  revalidatePath('/dashboard');
}
