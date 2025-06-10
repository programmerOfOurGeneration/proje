import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// Adminleri listele
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const adminler = await prisma.kullanici.findMany({
      where: {
        isAdmin: true
      },
      select: {
        id: true,
        isim: true,
        email: true,
        resim: true
      }
    });

    return NextResponse.json(adminler);
  } catch (error) {
    console.error('Adminler listelenemedi:', error);
    return NextResponse.json({ error: 'Adminler listelenemedi' }, { status: 500 });
  }
}

// Yeni mesaj gönder
export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const data = await request.json();
    const { aliciId, icerik } = data;

    // Göndereni bul
    const gonderen = await prisma.kullanici.findUnique({
      where: {
        email: session.user.email
      }
    });

    // Alıcıyı kontrol et
    const alici = await prisma.kullanici.findUnique({
      where: {
        id: aliciId
      }
    });

    if (!alici) {
      return NextResponse.json({ error: 'Alıcı bulunamadı' }, { status: 404 });
    }

    // Admin olmayan kullanıcılar sadece adminlere mesaj gönderebilir
    if (!gonderen.isAdmin && !alici.isAdmin) {
      return NextResponse.json({ error: 'Sadece adminlerle mesajlaşabilirsiniz' }, { status: 403 });
    }

    const mesaj = await prisma.ozelMesaj.create({
      data: {
        icerik,
        gonderenId: gonderen.id,
        aliciId
      },
      include: {
        gonderen: true,
        alici: true
      }
    });

    return NextResponse.json(mesaj);
  } catch (error) {
    console.error('Mesaj gönderilemedi:', error);
    return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 });
  }
}
