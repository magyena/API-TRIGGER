import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const platforms = await db.platform.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ platforms });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (session?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya Admin yang dapat menambah platform' }, { status: 403 });
    }

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Nama platform wajib diisi' }, { status: 400 });
    }

    const platform = await db.platform.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    return NextResponse.json({ platform });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
