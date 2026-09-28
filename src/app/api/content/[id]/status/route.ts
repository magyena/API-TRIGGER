import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { newStatus, statusRunning, grade, note } = body;

    const existing = await db.contentRequest.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Konten tidak ditemukan' }, { status: 404 });

    const updateData: any = {};
    if (newStatus && newStatus !== existing.status) {
      updateData.status = newStatus;
    }
    if (statusRunning) updateData.statusRunning = statusRunning;
    if (grade) updateData.grade = grade;

    const updated = await db.contentRequest.update({
      where: { id },
      data: updateData,
    });

    if (newStatus && newStatus !== existing.status) {
      // Record status history
      await db.contentStatusHistory.create({
        data: {
          contentId: id,
          previousStatus: existing.status,
          newStatus,
          changedById: session.id,
          note: note || `Status diubah dari ${existing.status} ke ${newStatus}`,
        },
      });

      // Send notifications to involved team members
      const recipients = [existing.advertiserId, existing.copywriterId, existing.videoEditorId]
        .filter(Boolean)
        .filter((userId) => userId !== session.id);

      for (const recipientId of recipients) {
        if (recipientId) {
          await db.notification.create({
            data: {
              userId: recipientId,
              contentId: id,
              title: `Status Update: ${newStatus}`,
              message: `${session.name} mengubah status ${id} (${existing.campaignName}) menjadi ${newStatus}.`,
              link: `/dashboard/content/${id}`,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, content: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
