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

  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get('subjectId');

  if (!subjectId) return NextResponse.json({ error: 'subjectId string query is required' }, { status: 400 });

  try {
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject || subject.userId !== user.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const topics = await prisma.topic.findMany({
      where: { subjectId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { summaries: true, questions: true }
        }
      }
    });
    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromReq(req);
  if (!user || !user.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, subjectId } = await req.json();
    if (!name || !subjectId) return NextResponse.json({ error: 'Name and subjectId are required' }, { status: 400 });

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject || subject.userId !== user.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const topic = await prisma.topic.create({
      data: {
        name,
        subjectId,
      }
    });
    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}
