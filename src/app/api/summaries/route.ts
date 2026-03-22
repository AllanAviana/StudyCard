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
  const topicId = searchParams.get('topicId');
  if (!topicId) return NextResponse.json({ error: 'topicId string query is required' }, { status: 400 });

  try {
    const topic = await prisma.topic.findUnique({ where: { id: topicId }, include: { subject: true } });
    if (!topic || topic.subject.userId !== user.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const summaries = await prisma.summary.findMany({
      where: { topicId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(summaries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch summaries' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromReq(req);
  if (!user || !user.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, content, topicId } = await req.json();
    if (!title || !content || !topicId) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });

    const topic = await prisma.topic.findUnique({ where: { id: topicId }, include: { subject: true } });
    if (!topic || topic.subject.userId !== user.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const summary = await prisma.summary.create({
      data: { title, content, topicId }
    });
    return NextResponse.json(summary, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create summary' }, { status: 500 });
  }
}
