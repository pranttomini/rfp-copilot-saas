import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@rfpcopilot.local';
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      name: 'Demo User',
      passwordHash,
      answers: {
        create: [
          {
            questionKey: 'company-overview',
            title: 'Company Overview',
            body: 'We are a software consultancy specializing in secure cloud platforms and AI-assisted workflows.',
            tags: 'company,overview'
          },
          {
            questionKey: 'delivery-approach',
            title: 'Delivery Approach',
            body: 'We use a phased delivery model: discovery, implementation, QA, and enablement with weekly stakeholder sync.',
            tags: 'delivery,methodology'
          }
        ]
      }
    }
  });

  await prisma.project.create({
    data: {
      name: 'Sample RFP - City Services Portal',
      description: 'Demo project seeded for first run',
      status: 'Drafting',
      ownerId: user.id,
      rfpRawText: 'Vendor shall provide project plan by 2026-04-10. Must ensure GDPR compliance. Proposal due 2026-03-30.',
      requirements: {
        create: [
          {
            title: 'Submit project plan',
            details: 'Vendor shall provide project plan by 2026-04-10.',
            deadline: '2026-04-10',
            priority: 'High',
            status: 'DRAFTED'
          },
          {
            title: 'Ensure GDPR compliance',
            details: 'Must ensure GDPR compliance.',
            priority: 'High'
          }
        ]
      }
    }
  });

  console.log('Seed complete: demo@rfpcopilot.local / demo1234');
}

main().finally(() => prisma.$disconnect());
