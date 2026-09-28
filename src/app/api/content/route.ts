import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const platform = searchParams.get('platform');
    const entity = searchParams.get('entity');
    const advertiserId = searchParams.get('advertiserId');
    const copywriterId = searchParams.get('copywriterId');
    const videoEditorId = searchParams.get('videoEditorId');
    const campaignStatus = searchParams.get('campaignStatus');
    const statusRunning = searchParams.get('statusRunning');
    const myRequests = searchParams.get('myRequests');
    const urgentOnly = searchParams.get('urgentOnly');

    const session = await getSessionUser();

    const where: any = {};

    if (search) {
      where.OR = [
        { id: { contains: search } },
        { campaignName: { contains: search } },
        { title: { contains: search } },
        { entityName: { contains: search } },
        { platformName: { contains: search } },
        { briefAdvertiser: { contains: search } },
        { contentCategory: { contains: search } },
        { advertiser: { name: { contains: search } } },
        { copywriter: { name: { contains: search } } },
        { videoEditor: { name: { contains: search } } },
      ];
    }

    if (status && status !== 'ALL') where.status = status;
    if (priority && priority !== 'ALL') where.priority = priority;
    if (platform && platform !== 'ALL') where.platformName = platform;
    if (entity && entity !== 'ALL') where.entityName = entity;
    if (advertiserId && advertiserId !== 'ALL') where.advertiserId = advertiserId;
    if (copywriterId && copywriterId !== 'ALL') where.copywriterId = copywriterId;
    if (videoEditorId && videoEditorId !== 'ALL') where.videoEditorId = videoEditorId;
    if (campaignStatus && campaignStatus !== 'ALL') where.campaignStatus = campaignStatus;
    if (statusRunning && statusRunning !== 'ALL') where.statusRunning = statusRunning;

    if (myRequests === 'true' && session) {
      where.OR = [
        { advertiserId: session.id },
        { copywriterId: session.id },
        { videoEditorId: session.id },
        { createdById: session.id },
      ];
    }

    if (urgentOnly === 'true') {
      const now = new Date();
      const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      where.OR = [
        { priority: 'Urgent' },
        { deadline: { lt: now }, status: { not: 'PUBLISHED' } },
        { deadline: { lte: next24h }, status: { not: 'PUBLISHED' } },
        { status: 'REVISION' },
        { status: 'INTERNAL_REVIEW' },
      ];
    }

    const contents = await db.contentRequest.findMany({
      where,
      include: {
        advertiser: { select: { id: true, name: true, role: true, avatarUrl: true } },
        copywriter: { select: { id: true, name: true, role: true, avatarUrl: true } },
        videoEditor: { select: { id: true, name: true, role: true, avatarUrl: true } },
        createdBy: { select: { id: true, name: true, role: true, avatarUrl: true } },
        _count: {
          select: {
            revisions: true,
            comments: true,
            versions: true,
          },
        },
      },
      orderBy: { deadline: 'asc' },
    });

    return NextResponse.json({ contents });
  } catch (error: any) {
    console.error('Fetch contents error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    const body = await req.json();

    const {
      campaignName,
      campaignStatus,
      entityName,
      platformName,
      campaignUrl,
      shortUrl,
      contentCategory,
      priority,
      deadline,
      advertiserId,
      copywriterId,
      videoEditorId,
      title,
      videoCount,
      briefAdvertiser,
      objective,
      targetAudience,
      keyMessage,
      cta,
      toDo,
      additionalInfo,
      assetLink,
      referenceUrl,
      previousVt,
      campaignRefUrl,
      additionalRefLinks,
    } = body;

    if (!campaignName || !entityName || !platformName || !deadline) {
      return NextResponse.json(
        { error: 'Campaign, Entitas, Platform, dan Deadline wajib diisi' },
        { status: 400 }
      );
    }

    // Auto-generate Content ID: CNT-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const prefix = `CNT-${currentYear}-`;
    const lastContent = await db.contentRequest.findFirst({
      where: { id: { startsWith: prefix } },
      orderBy: { id: 'desc' },
    });

    let nextNumber = 1;
    if (lastContent) {
      const parts = lastContent.id.split('-');
      if (parts.length === 3) {
        const parsed = parseInt(parts[2], 10);
        if (!isNaN(parsed)) nextNumber = parsed + 1;
      }
    }

    const formattedId = `${prefix}${String(nextNumber).padStart(4, '0')}`;

    // Ensure Campaign, Entity, Platform exist in master tables
    let campaign = await db.campaign.findUnique({ where: { name: campaignName } });
    if (!campaign) {
      campaign = await db.campaign.create({
        data: { name: campaignName, status: campaignStatus || 'New', url: campaignUrl, shortUrl },
      });
    }

    let entity = await db.entity.findUnique({ where: { name: entityName } });
    if (!entity) {
      entity = await db.entity.create({ data: { name: entityName } });
    }

    let platform = await db.platform.findUnique({ where: { name: platformName } });
    if (!platform) {
      platform = await db.platform.create({ data: { name: platformName } });
    }

    const newContent = await db.contentRequest.create({
      data: {
        id: formattedId,
        campaignId: campaign.id,
        campaignName,
        campaignStatus: campaignStatus || 'New',
        entityId: entity.id,
        entityName,
        platformId: platform.id,
        platformName,
        campaignUrl,
        shortUrl,
        contentCategory,
        priority: priority || 'Medium',
        deadline: new Date(deadline),
        advertiserId,
        copywriterId,
        videoEditorId,
        createdById: session?.id,
        title: title || campaignName,
        videoCount: Number(videoCount) || 1,
        briefAdvertiser,
        objective,
        targetAudience,
        keyMessage,
        cta,
        toDo,
        additionalInfo,
        assetLink,
        referenceUrl,
        previousVt,
        campaignRefUrl,
        additionalRefLinks: typeof additionalRefLinks === 'object' ? JSON.stringify(additionalRefLinks) : additionalRefLinks,
        status: 'REQUESTED',
        statusRunning: 'Belum Running',
      },
    });

    // Record initial status history
    await db.contentStatusHistory.create({
      data: {
        contentId: newContent.id,
        newStatus: 'REQUESTED',
        changedById: session?.id,
        note: 'Content request created',
      },
    });

    // Create notifications for assigned team members
    const assignees = [advertiserId, copywriterId, videoEditorId].filter(Boolean);
    for (const assigneeId of assignees) {
      await db.notification.create({
        data: {
          userId: assigneeId,
          contentId: newContent.id,
          title: 'Konten Baru Diberikan',
          message: `Anda ditugaskan pada permintaan konten ${newContent.id} (${newContent.campaignName}).`,
          link: `/dashboard/content/${newContent.id}`,
        },
      });
    }

    return NextResponse.json({ success: true, content: newContent }, { status: 201 });
  } catch (error: any) {
    console.error('Create content error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
