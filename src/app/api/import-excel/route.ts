import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (session?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya Admin yang dapat mengimpor data Excel/CSV' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const mode = formData.get('mode') as string; // 'preview' or 'execute'

    if (!file) {
      return NextResponse.json({ error: 'File Excel/CSV tidak ditemukan' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rows.length === 0) {
      return NextResponse.json({ error: 'File Excel kosong atau format tidak sesuai' }, { status: 400 });
    }

    // Fetch existing users for name matching
    const users = await db.user.findMany({ select: { id: true, name: true, role: true } });
    const userMap = new Map<string, string>();
    users.forEach((u) => userMap.set(u.name.toLowerCase().trim(), u.id));

    const parsedData: any[] = [];
    const errors: string[] = [];

    const currentYear = new Date().getFullYear();
    let currentIdCount = 10; // Start offset for imported items

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 2; // Row number in Excel (1-based header)

      const campaignName = String(row['Campaign'] || row['campaign'] || '').trim();
      if (!campaignName) {
        // Skip empty spacer rows
        continue;
      }

      const entityName = String(row['Entitas'] || row['entitas'] || 'Umum').trim();
      const platformName = String(row['Platform'] || row['platform'] || 'Web').trim();
      const priorityRaw = String(row['Status (Urgent, Medium, Low)'] || row['Priority'] || row['priority'] || 'Medium').trim();
      
      let priority = 'Medium';
      if (priorityRaw.toLowerCase().includes('urgent')) priority = 'Urgent';
      else if (priorityRaw.toLowerCase().includes('low')) priority = 'Low';

      const copywriterName = String(row['Copywriter'] || '').trim();
      const videoEditorName = String(row['Video Editor'] || '').trim();
      const advertiserName = String(row['Advertiser'] || '').trim();

      const copywriterId = userMap.get(copywriterName.toLowerCase());
      const videoEditorId = userMap.get(videoEditorName.toLowerCase());
      const advertiserId = userMap.get(advertiserName.toLowerCase());

      const deadlineRaw = row['Deadline'];
      let deadlineDate = new Date();
      if (deadlineRaw) {
        const d = new Date(deadlineRaw);
        if (!isNaN(d.getTime())) {
          deadlineDate = d;
        }
      }

      const id = `CNT-${currentYear}-${String(currentIdCount++).padStart(4, '0')}`;

      const item = {
        id,
        campaignName,
        campaignStatus: String(row['Status Leads'] || 'New').trim() === 'Maintenance' ? 'Maintenance' : 'New',
        entityName,
        platformName,
        priority,
        deadline: deadlineDate,
        campaignUrl: String(row['Link Campaign Lama Kibi / Platform internal (referensi)'] || '').trim(),
        shortUrl: String(row['short url baru / maintenance'] || '').trim(),
        assetLink: String(row['Link Aset'] || '').trim(),
        briefAdvertiser: String(row['Brief Advertiser'] || '').trim(),
        grade: String(row['Grade'] || '').trim() || 'B',
        previousVt: String(row['VT Sebelumnya'] || '').trim(),
        toDo: String(row['To Do'] || '').trim(),
        referenceUrl: String(row['Referensi / Benchmark'] || '').trim(),
        additionalInfo: String(row['Informasi Tambahan'] || '').trim(),
        statusRunning: String(row['Status Running'] || 'Belum Running').trim(),
        status: 'REQUESTED',
        advertiserId,
        copywriterId,
        videoEditorId,
        copywriterName,
        videoEditorName,
        advertiserName,
      };

      parsedData.push(item);
    }

    if (mode === 'preview') {
      return NextResponse.json({
        totalParsed: parsedData.length,
        preview: parsedData.slice(0, 10),
        errors,
      });
    }

    // Execute Import into DB
    let importedCount = 0;
    for (const item of parsedData) {
      // Ensure entity & platform exist
      let entity = await db.entity.findUnique({ where: { name: item.entityName } });
      if (!entity) entity = await db.entity.create({ data: { name: item.entityName } });

      let platform = await db.platform.findUnique({ where: { name: item.platformName } });
      if (!platform) platform = await db.platform.create({ data: { name: item.platformName } });

      let campaign = await db.campaign.findUnique({ where: { name: item.campaignName } });
      if (!campaign) campaign = await db.campaign.create({ data: { name: item.campaignName } });

      await db.contentRequest.create({
        data: {
          id: item.id,
          campaignId: campaign.id,
          campaignName: item.campaignName,
          campaignStatus: item.campaignStatus,
          entityId: entity.id,
          entityName: item.entityName,
          platformId: platform.id,
          platformName: item.platformName,
          campaignUrl: item.campaignUrl,
          shortUrl: item.shortUrl,
          priority: item.priority,
          deadline: item.deadline,
          assetLink: item.assetLink,
          briefAdvertiser: item.briefAdvertiser,
          grade: item.grade,
          previousVt: item.previousVt,
          toDo: item.toDo,
          referenceUrl: item.referenceUrl,
          additionalInfo: item.additionalInfo,
          statusRunning: item.statusRunning,
          status: item.status,
          advertiserId: item.advertiserId,
          copywriterId: item.copywriterId,
          videoEditorId: item.videoEditorId,
          createdById: session.id,
          title: item.campaignName,
        },
      });

      await db.contentStatusHistory.create({
        data: {
          contentId: item.id,
          newStatus: 'REQUESTED',
          changedById: session.id,
          note: 'Impor massal dari Excel',
        },
      });

      importedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${importedCount} permintaan konten dari Excel.`,
      importedCount,
    });
  } catch (error: any) {
    console.error('Excel import error:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengimpor file Excel' }, { status: 500 });
  }
}
