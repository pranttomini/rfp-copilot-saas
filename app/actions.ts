'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { clearSession, login, register, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateDraft, parseRfpText } from '@/lib/rfp-parser';

export async function registerAction(formData: FormData) {
  const schema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() });
  const parsed = schema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name') || undefined
  });
  await register(parsed.email, parsed.password, parsed.name);
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
  const name = String(formData.get('name') || 'Untitled Project');
  const description = String(formData.get('description') || '');
  await prisma.project.create({ data: { name, description, ownerId: user.id } });
  revalidatePath('/dashboard');
}

export async function addAnswerAction(formData: FormData) {
  const user = await requireUser();
  await prisma.answer.create({
    data: {
      ownerId: user.id,
      questionKey: String(formData.get('questionKey') || '').trim(),
      title: String(formData.get('title') || '').trim(),
      body: String(formData.get('body') || '').trim(),
      tags: String(formData.get('tags') || '').trim()
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
  const file = formData.get('file') as File;
  if (!file) return;
  if (!['text/plain', 'text/markdown', 'application/octet-stream'].includes(file.type) && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
    throw new Error('Only .txt/.md supported in MVP');
  }

  const text = await file.text();
  const parsed = parseRfpText(text);

  await prisma.project.updateMany({ where: { id: projectId, ownerId: user.id }, data: { rfpRawText: text, status: 'Parsed' } });
  await prisma.projectRequirement.deleteMany({ where: { projectId } });
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
    prisma.projectRequirement.findMany({ where: { projectId }, orderBy: { title: 'asc' } }),
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
  const id = String(formData.get('id'));
  const status = String(formData.get('status'));
  await requireUser();
  await prisma.projectRequirement.update({ where: { id }, data: { status } });
  revalidatePath('/dashboard');
}
