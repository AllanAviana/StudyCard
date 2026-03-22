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
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject || subject.userId !== user.userId) {
      return NextResponse.json({ error: 'Subject not found or unauthorized' }, { status: 404 });
    }

    await prisma.subject.delete({ where: { id } });
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
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject || subject.userId !== user.userId) {
      return NextResponse.json({ error: 'Subject not found or unauthorized' }, { status: 404 });
    }

    const { name, color } = await req.json();
    const updated = await prisma.subject.update({
      where: { id },
      data: { name, color }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
