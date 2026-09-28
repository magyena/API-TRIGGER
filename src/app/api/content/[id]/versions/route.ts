import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const versions = await db.contentVersion.findMany({
      where: { contentId: id },
      include: {
        uploadedBy: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
      orderBy: { versionNumber: 'desc' },
    });
    return NextResponse.json({ versions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, script, videoUrl, assetUrl, thumbnailUrl, publishedUrl, status } = await req.json();

    const count = await db.contentVersion.count({ where: { contentId: id } });
    const versionNumber = count + 1;

    const version = await db.contentVersion.create({
      data: {
        contentId: id,
        versionNumber,
        title: title || `Version ${versionNumber}`,
        script,
        videoUrl,
        assetUrl,
        thumbnailUrl,
        publishedUrl,
        status: status || 'Review',
        uploadedById: session.id,
      },
      include: {
        uploadedBy: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
    });

    // Update main content request with latest output if provided
    const updatePayload: any = {};
    if (script) updatePayload.script = script;
    if (videoUrl) updatePayload.finalVideoUrl = videoUrl;
    if (publishedUrl) updatePayload.publishedUrl = publishedUrl;

    if (Object.keys(updatePayload).length > 0) {
      await db.contentRequest.update({
        where: { id },
        data: updatePayload,
      });
    }

    return NextResponse.json({ success: true, version }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
