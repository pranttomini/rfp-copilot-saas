'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { clearSession, login, register, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractTextFromUpload } from '@/lib/file-extract';
import { generateDraft, parseRfpText } from '@/lib/rfp-parser';

function go(path: string, type: 'success' | 'error', message: string): never {
  redirect(`${path}?${new URLSearchParams({ toast: type, message }).toString()}`);
}

export async function registerAction(formData: FormData) {
  const schema = z.object({
    email: z.string().email('Bitte eine gültige E-Mail-Adresse eingeben.'),
    password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen haben.'),
    name: z.string().trim().max(80).optional()
  });
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name') || undefined
  });

  const data = parsed.success
    ? parsed.data
    : go('/register', 'error', parsed.error.issues[0]?.message || 'Bitte Eingaben prüfen.');

  try {
    await register(data.email, data.password, data.name);
  } catch {
    go('/register', 'error', 'Diese E-Mail ist bereits registriert.');
  }

  go('/dashboard', 'success', 'Konto erfolgreich erstellt. Willkommen!');
}

export async function loginAction(formData: FormData) {
  const schema = z.object({
    email: z.string().email('Bitte eine gültige E-Mail-Adresse eingeben.'),
    password: z.string().min(1, 'Passwort darf nicht leer sein.')
  });
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });

  const data = parsed.success
    ? parsed.data
    : go('/login', 'error', parsed.error.issues[0]?.message || 'Ungültige Eingabe.');

  const user = await login(data.email, data.password);
  if (!user) go('/login', 'error', 'Ungültige Zugangsdaten.');

  go('/dashboard', 'success', 'Erfolgreich eingeloggt.');
}

export async function logoutAction() {
  await clearSession();
  redirect('/login');
}

export async function createProjectAction(formData: FormData) {
  const user = await requireUser();
  const schema = z.object({
    name: z.string().trim().min(2, 'Projektname muss mindestens 2 Zeichen haben.').max(120),
    description: z.string().trim().max(400).optional()
  });
  const parsed = schema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined
  });

  const data = parsed.success
    ? parsed.data
    : go('/dashboard', 'error', parsed.error.issues[0]?.message || 'Projekt konnte nicht erstellt werden.');

  await prisma.project.create({ data: { name: data.name, description: data.description, ownerId: user.id } });
  revalidatePath('/dashboard');
  go('/dashboard', 'success', 'Projekt erstellt.');
}

export async function addAnswerAction(formData: FormData) {
  const user = await requireUser();
  const schema = z.object({
    questionKey: z.string().trim().min(2, 'Schlüssel muss mindestens 2 Zeichen haben.'),
    title: z.string().trim().min(2, 'Titel muss mindestens 2 Zeichen haben.'),
    body: z.string().trim().min(10, 'Antworttext muss mindestens 10 Zeichen haben.'),
    tags: z.string().trim().optional()
  });
  const parsed = schema.safeParse({
    questionKey: formData.get('questionKey'),
    title: formData.get('title'),
    body: formData.get('body'),
    tags: formData.get('tags') || undefined
  });

  const data = parsed.success
    ? parsed.data
    : go('/dashboard/library', 'error', parsed.error.issues[0]?.message || 'Baustein konnte nicht erstellt werden.');

  await prisma.answer.create({
    data: {
      ownerId: user.id,
      questionKey: data.questionKey,
      title: data.title,
      body: data.body,
      tags: data.tags || ''
    }
  });
  revalidatePath('/dashboard/library');
  go('/dashboard/library', 'success', 'Baustein erstellt.');
}

export async function updateAnswerAction(formData: FormData) {
  const user = await requireUser();
  const schema = z.object({
    id: z.string().trim().min(2),
    questionKey: z.string().trim().min(2, 'Schlüssel muss mindestens 2 Zeichen haben.'),
    title: z.string().trim().min(2, 'Titel muss mindestens 2 Zeichen haben.'),
    body: z.string().trim().min(10, 'Antworttext muss mindestens 10 Zeichen haben.'),
    tags: z.string().trim().optional()
  });

  const parsed = schema.safeParse({
    id: formData.get('id'),
    questionKey: formData.get('questionKey'),
    title: formData.get('title'),
    body: formData.get('body'),
    tags: formData.get('tags') || undefined
  });

  const data = parsed.success
    ? parsed.data
    : go('/dashboard/library', 'error', parsed.error.issues[0]?.message || 'Baustein konnte nicht aktualisiert werden.');

  const updated = await prisma.answer.updateMany({
    where: { id: data.id, ownerId: user.id },
    data: {
      questionKey: data.questionKey,
      title: data.title,
      body: data.body,
      tags: data.tags || ''
    }
  });

  if (!updated.count) go('/dashboard/library', 'error', 'Baustein nicht gefunden oder keine Berechtigung.');

  revalidatePath('/dashboard/library');
  go('/dashboard/library', 'success', 'Baustein aktualisiert.');
}

export async function deleteAnswerAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get('id') || '');
  if (!id) go('/dashboard/library', 'error', 'Ungültige Anfrage.');

  const deleted = await prisma.answer.deleteMany({ where: { id, ownerId: user.id } });
  if (!deleted.count) go('/dashboard/library', 'error', 'Baustein nicht gefunden oder keine Berechtigung.');

  revalidatePath('/dashboard/library');
  go('/dashboard/library', 'success', 'Baustein gelöscht.');
}

export async function uploadRfpAction(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get('projectId') || '');
  const file = formData.get('file') as File | null;

  if (!projectId) go('/dashboard', 'error', 'Projekt fehlt.');

  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: user.id }, select: { id: true } });
  if (!project) go('/dashboard', 'error', 'Projekt nicht gefunden oder keine Berechtigung.');

  const selectedFile = file && file.name ? file : go(`/dashboard/projects/${projectId}`, 'error', 'Bitte eine Datei auswählen.');

  const allowedExtensions = ['.md', '.txt', '.docx', '.pdf'];
  const lowerName = selectedFile.name.toLowerCase();
  const isAllowed = allowedExtensions.some((ext) => lowerName.endsWith(ext));
  if (!isAllowed) go(`/dashboard/projects/${projectId}`, 'error', 'Unsupported file format. Use .txt, .md, .docx, or .pdf');

  const extraction = await extractTextFromUpload(selectedFile).catch(() =>
    go(`/dashboard/projects/${projectId}`, 'error', 'Datei konnte nicht gelesen werden. Bitte erneut versuchen.')
  );

  if (!extraction.text?.trim()) {
    const warning = extraction.warning || 'Keine lesbaren Inhalte erkannt.';
    go(`/dashboard/projects/${projectId}`, 'error', `Upload fehlgeschlagen: ${warning}`);
  }

  const parsed = parseRfpText(extraction.text);

  await prisma.project.update({
    where: { id: projectId },
    data: {
      rfpRawText: extraction.warning ? `[Extraction notice] ${extraction.warning}\n\n${extraction.text}` : extraction.text,
      status: parsed.length ? 'Parsed' : 'Intake'
    }
  });

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
  go(
    `/dashboard/projects/${projectId}`,
    'success',
    parsed.length
      ? `${parsed.length} Anforderungen erkannt und gespeichert.`
      : extraction.warning || 'Datei verarbeitet, aber keine Anforderungen erkannt.'
  );
}

export async function generateDraftsAction(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get('projectId') || '');
  if (!projectId) go('/dashboard', 'error', 'Projekt fehlt.');

  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: user.id }, select: { id: true } });
  if (!project) go('/dashboard', 'error', 'Projekt nicht gefunden oder keine Berechtigung.');

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

  await prisma.project.update({ where: { id: projectId }, data: { status: requirements.length ? 'Drafting' : 'Parsed' } });
  revalidatePath(`/dashboard/projects/${projectId}`);
  go(`/dashboard/projects/${projectId}`, 'success', requirements.length ? `${requirements.length} Drafts erstellt.` : 'Keine Anforderungen zum Draften gefunden.');
}

export async function updateRequirementStatusAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '');
  const projectId = String(formData.get('projectId') || '');
  if (!['TODO', 'DRAFTED', 'REVIEWED', 'SUBMITTED'].includes(status) || !id || !projectId) {
    go(`/dashboard/projects/${projectId || ''}`, 'error', 'Ungültiger Statuswechsel.');
  }

  const updated = await prisma.projectRequirement.updateMany({
    where: { id, projectId, project: { ownerId: user.id } },
    data: { status }
  });

  if (!updated.count) go(`/dashboard/projects/${projectId}`, 'error', 'Anforderung nicht gefunden oder keine Berechtigung.');

  revalidatePath(`/dashboard/projects/${projectId}`);
  go(`/dashboard/projects/${projectId}`, 'success', 'Status aktualisiert.');
}
