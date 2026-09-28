import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            copywriterRequests: true,
            videoEditorRequests: true,
            advertiserRequests: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (session?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin yang dapat menambah pengguna.' }, { status: 403 });
    }

    const body = await req.json();
    const { email, password, name, role, avatarUrl } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Field email, password, name, dan role wajib diisi' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 });
    }

    const newUser = await db.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        name,
        role,
        avatarUrl: avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
