import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function getUserFromReq(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function GET(req: NextRequest) {
  const user = await getUserFromReq(req);
  if (!user || !user.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const subjects = await prisma.subject.findMany({
      where: { userId: user.userId as string },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { topics: true }
        }
      }
    });
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromReq(req);
  if (!user || !user.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, color } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const subject = await prisma.subject.create({
      data: {
        name,
        color: color || '#3B82F6',
        userId: user.userId as string,
      }
    });
    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
