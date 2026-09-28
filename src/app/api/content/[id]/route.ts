import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const content = await db.contentRequest.findUnique({
      where: { id },
      include: {
        campaign: true,
        entity: true,
        platform: true,
        advertiser: { select: { id: true, name: true, role: true, avatarUrl: true, email: true } },
        copywriter: { select: { id: true, name: true, role: true, avatarUrl: true, email: true } },
        videoEditor: { select: { id: true, name: true, role: true, avatarUrl: true, email: true } },
        createdBy: { select: { id: true, name: true, role: true, avatarUrl: true } },
        statusHistory: {
          include: {
            changedBy: { select: { id: true, name: true, role: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        revisions: {
          include: {
            requestedBy: { select: { id: true, name: true, role: true, avatarUrl: true } },
            assignedTo: { select: { id: true, name: true, role: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        versions: {
          include: {
            uploadedBy: { select: { id: true, name: true, role: true, avatarUrl: true } },
          },
          orderBy: { versionNumber: 'desc' },
        },
        comments: {
          include: {
            user: { select: { id: true, name: true, role: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'Konten tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const updated = await db.contentRequest.update({
      where: { id },
      data: {
        ...body,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        videoCount: body.videoCount ? Number(body.videoCount) : undefined,
        additionalRefLinks: typeof body.additionalRefLinks === 'object' ? JSON.stringify(body.additionalRefLinks) : body.additionalRefLinks,
      },
      include: {
        advertiser: true,
        copywriter: true,
        videoEditor: true,
      },
    });

    return NextResponse.json({ success: true, content: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSessionUser();
    if (session?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya Admin yang dapat menghapus konten' }, { status: 403 });
    }

    await db.contentRequest.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Konten berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
