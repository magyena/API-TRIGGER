import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const revisions = await db.contentRevision.findMany({
      where: { contentId: id },
      include: {
        requestedBy: { select: { id: true, name: true, role: true, avatarUrl: true } },
        assignedTo: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
      orderBy: { revisionNumber: 'desc' },
    });
    return NextResponse.json({ revisions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { feedback, assignedToId } = await req.json();
    if (!feedback) {
      return NextResponse.json({ error: 'Feedback revisi wajib diisi' }, { status: 400 });
    }

    const content = await db.contentRequest.findUnique({ where: { id } });
    if (!content) return NextResponse.json({ error: 'Konten tidak ditemukan' }, { status: 404 });

    // Count existing revisions to calculate next revision number
    const count = await db.contentRevision.count({ where: { contentId: id } });
    const revisionNumber = count + 1;

    const revision = await db.contentRevision.create({
      data: {
        contentId: id,
        revisionNumber,
        feedback,
        requestedById: session.id,
        assignedToId: assignedToId || content.videoEditorId || content.copywriterId,
        isCompleted: false,
      },
      include: {
        requestedBy: { select: { id: true, name: true, role: true, avatarUrl: true } },
        assignedTo: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
    });

    // Update content status to REVISION
    const previousStatus = content.status;
    await db.contentRequest.update({
      where: { id },
      data: { status: 'REVISION' },
    });

    // Add status history
    await db.contentStatusHistory.create({
      data: {
        contentId: id,
        previousStatus,
        newStatus: 'REVISION',
        changedById: session.id,
        note: `Permintaan Revisi #${revisionNumber}: "${feedback.slice(0, 80)}..."`,
      },
    });

    // Notify assigned team member
    const targetUser = assignedToId || content.videoEditorId || content.copywriterId;
    if (targetUser) {
      await db.notification.create({
        data: {
          userId: targetUser,
          contentId: id,
          title: `Revisi #${revisionNumber} Diberikan`,
          message: `${session.name} memberikan catatan revisi untuk ${id} (${content.campaignName}).`,
          link: `/dashboard/content/${id}`,
        },
      });
    }

    return NextResponse.json({ success: true, revision }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { revisionId, isCompleted } = await req.json();

    const revision = await db.contentRevision.update({
      where: { id: revisionId },
      data: {
        isCompleted: isCompleted ?? true,
        completedAt: isCompleted !== false ? new Date() : null,
      },
    });

    const content = await db.contentRequest.findUnique({ where: { id } });
    if (content && isCompleted !== false) {
      // Check if all revisions are completed
      const pendingCount = await db.contentRevision.count({
        where: { contentId: id, isCompleted: false },
      });

      if (pendingCount === 0) {
        const previousStatus = content.status;
        await db.contentRequest.update({
          where: { id },
          data: { status: 'INTERNAL_REVIEW' },
        });

        await db.contentStatusHistory.create({
          data: {
            contentId: id,
            previousStatus,
            newStatus: 'INTERNAL_REVIEW',
            changedById: session.id,
            note: `Revisi #${revision.revisionNumber} telah diselesaikan. Kembali ke Internal Review.`,
          },
        });

        if (content.advertiserId && content.advertiserId !== session.id) {
          await db.notification.create({
            data: {
              userId: content.advertiserId,
              contentId: id,
              title: `Revisi #${revision.revisionNumber} Selesai`,
              message: `${session.name} telah menyelesaikan revisi untuk ${id}.`,
              link: `/dashboard/content/${id}`,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, revision });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
