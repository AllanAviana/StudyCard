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

    const questions = await prisma.question.findMany({
      where: { topicId },
      orderBy: { createdAt: 'desc' }
    });
    
    // Parse options for the frontend
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }));
    
    return NextResponse.json(parsedQuestions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromReq(req);
  if (!user || !user.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { statement, options, correctAnswer, comment, topicId } = await req.json();
    if (!statement || !options || !topicId) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });

    const topic = await prisma.topic.findUnique({ where: { id: topicId }, include: { subject: true } });
    if (!topic || topic.subject.userId !== user.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const question = await prisma.question.create({
      data: { 
        statement, 
        options: JSON.stringify(options), 
        correctAnswer, 
        comment, 
        topicId 
      }
    });
    
    return NextResponse.json({
        ...question,
        options: JSON.parse(question.options)
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
