import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Geçersiz ID' }, { status: 400 });
    }

    const etkinlik = await prisma.etkinlik.findUnique({
      where: { id },
      include: {
        resimler: true,
        videolar: true,
      },
    });

    if (!etkinlik) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(etkinlik);
  } catch (error) {
    console.error('Etkinlik alınamadı:', error);
    return NextResponse.json({ error: 'Etkinlik alınamadı' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
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
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Geçersiz ID' }, { status: 400 });
    }

    const data = await request.json();

    // Önce mevcut resimleri ve videoları sil
    await prisma.etkinlikResim.deleteMany({
      where: { etkinlikId: id },
    });
    
    await prisma.etkinlikVideo.deleteMany({
      where: { etkinlikId: id },
    });

    // Etkinliği güncelle
    const etkinlik = await prisma.etkinlik.update({
      where: { id },
      data: {
        baslik: data.baslik,
        aciklama: data.aciklama,
        icerik: data.icerik,
        tarih: new Date(data.tarih),
        konum: data.konum,
        resimUrl: data.resimUrl,
        resimler: {
          create: data.resimler,
        },
        videolar: {
          create: data.videolar,
        },
      },
      include: {
        resimler: true,
        videolar: true,
      },
    });
    
    return NextResponse.json(etkinlik);
  } catch (error) {
    console.error('Etkinlik güncellenemedi:', error);
    return NextResponse.json({ error: 'Etkinlik güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Geçersiz ID' }, { status: 400 });
    }

    // Önce ilişkili medyaları sil
    await prisma.etkinlikResim.deleteMany({
      where: { etkinlikId: id },
    });
    
    await prisma.etkinlikVideo.deleteMany({
      where: { etkinlikId: id },
    });

    // Sonra etkinliği sil
    const etkinlik = await prisma.etkinlik.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Etkinlik başarıyla silindi', etkinlik });
  } catch (error) {
    console.error('Etkinlik silinemedi:', error);
    return NextResponse.json({ error: 'Etkinlik silinemedi' }, { status: 500 });
  }
}
