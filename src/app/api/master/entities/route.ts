import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const entities = await db.entity.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ entities });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (session?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya Admin yang dapat menambah entitas' }, { status: 403 });
    }

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Nama entitas wajib diisi' }, { status: 400 });
    }

    const entity = await db.entity.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    return NextResponse.json({ entity });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
