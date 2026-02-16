import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'ok',
        app: 'up',
        db: 'up',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: 'degraded',
        app: 'up',
        db: 'down',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
