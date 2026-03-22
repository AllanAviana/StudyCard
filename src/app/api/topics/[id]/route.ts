import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function getUserFromReq(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromReq(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const topic = await prisma.topic.findUnique({ 
      where: { id },
      include: { subject: true }
    });
    if (!topic || topic.subject.userId !== user.userId) {
      return NextResponse.json({ error: 'Topic not found or unauthorized' }, { status: 404 });
    }

    await prisma.topic.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromReq(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const topic = await prisma.topic.findUnique({ 
      where: { id },
      include: { subject: true }
    });
    if (!topic || topic.subject.userId !== user.userId) {
      return NextResponse.json({ error: 'Topic not found or unauthorized' }, { status: 404 });
    }

    const { name } = await req.json();
    const updated = await prisma.topic.update({
      where: { id },
      data: { name }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
