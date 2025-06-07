import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const iletisim = await prisma.iletisimBilgileri.findFirst();
    return NextResponse.json(iletisim || {
      firmaAdi: 'StageDesign',
      hakkimizda: 'Profesyonel sahne tasarımı ve teknik prodüksiyon hizmetleri sunan lider firma.',
      adres: 'Merkez Mah. Sahne Sk. No:1 Ankara',
      telefon: '+90 (312) 123 45 67',
      email: 'info@stagedesign.com',
      calismaSaatleri: 'Pazartesi - Cumartesi: 09:00 - 18:00',
      sosyalMedya: {
        facebook: 'https://facebook.com/stagedesign',
        instagram: 'https://instagram.com/stagedesign',
        twitter: 'https://twitter.com/stagedesign'
      }
    });
  } catch (error) {
    console.error('İletişim bilgileri alınamadı:', error);
    return NextResponse.json({ error: 'İletişim bilgileri alınamadı' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
  }

  const user = await prisma.kullanici.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
  }

  try {
    const data = await request.json();
    
    const iletisim = await prisma.iletisimBilgileri.upsert({
      where: {
        id: 1,
      },
      update: data,
      create: data,
    });
    
    return NextResponse.json(iletisim);
  } catch (error) {
    console.error('İletişim bilgileri güncellenemedi:', error);
    return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
  }
}
