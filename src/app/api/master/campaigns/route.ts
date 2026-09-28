import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const campaigns = await db.campaign.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, status, url, shortUrl, description } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Nama campaign wajib diisi' }, { status: 400 });
    }

    const campaign = await db.campaign.upsert({
      where: { name },
      update: { status, url, shortUrl, description },
      create: { name, status: status || 'New', url, shortUrl, description },
    });

    return NextResponse.json({ campaign });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
