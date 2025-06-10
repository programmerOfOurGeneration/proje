import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// Grup üyelerini ve mesajları getir
export async function GET(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const grupId = parseInt(params.id);
    const kullanici = await prisma.kullanici.findUnique({
      where: { email: session.user.email }
    });

    // Kullanıcının gruba erişim yetkisi var mı kontrol et
    const grupUyelik = await prisma.grupUyelik.findUnique({
      where: {
        grupId_uyeId: {
          grupId,
          uyeId: kullanici.id
        }
      }
    });

    if (!grupUyelik && !kullanici.isAdmin) {
      return NextResponse.json({ error: 'Bu gruba erişim yetkiniz yok' }, { status: 403 });
    }

    const grup = await prisma.sohbetGrubu.findUnique({
      where: { id: grupId },
      include: {
        mesajlar: {
          include: {
            gonderen: {
              select: {
                id: true,
                isim: true,
                email: true,
                isAdmin: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        uyeler: {
          include: {
            uye: {
              select: {
                id: true,
                isim: true,
                email: true,
                isAdmin: true
              }
            }
          }
        }
      }
    });

    if (!grup) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(grup);
  } catch (error) {
    console.error('Grup bilgileri alınamadı:', error);
    return NextResponse.json({ error: 'Grup bilgileri alınamadı' }, { status: 500 });
  }
}

// Gruba mesaj gönder
export async function POST(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const grupId = parseInt(params.id);
    const { icerik } = await request.json();
    const kullanici = await prisma.kullanici.findUnique({
      where: { email: session.user.email }
    });

    // Kullanıcının gruba erişim yetkisi var mı kontrol et
    const grupUyelik = await prisma.grupUyelik.findUnique({
      where: {
        grupId_uyeId: {
          grupId,
          uyeId: kullanici.id
        }
      }
    });

    if (!grupUyelik && !kullanici.isAdmin) {
      return NextResponse.json({ error: 'Bu gruba mesaj gönderme yetkiniz yok' }, { status: 403 });
    }

    const mesaj = await prisma.grupMesaj.create({
      data: {
        icerik,
        grupId,
        gonderenId: kullanici.id
      },
      include: {
        gonderen: true
      }
    });

    return NextResponse.json(mesaj);
  } catch (error) {
    console.error('Mesaj gönderilemedi:', error);
    return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 });
  }
}

// Grup üyelerini güncelle (sadece admin)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const kullanici = await prisma.kullanici.findUnique({
      where: { email: session.user.email }
    });

    if (!kullanici.isAdmin) {
      return NextResponse.json({ error: 'Sadece adminler grup üyelerini güncelleyebilir' }, { status: 403 });
    }

    const grupId = parseInt(params.id);
    const { uyeIdleri } = await request.json();

    // Önce tüm mevcut üyelikleri sil
    await prisma.grupUyelik.deleteMany({
      where: { grupId }
    });

    // Yeni üyelikleri ekle
    await prisma.grupUyelik.createMany({
      data: uyeIdleri.map(uyeId => ({
        grupId,
        uyeId
      }))
    });

    const guncelGrup = await prisma.sohbetGrubu.findUnique({
      where: { id: grupId },
      include: {
        uyeler: {
          include: {
            uye: true
          }
        }
      }
    });

    return NextResponse.json(guncelGrup);
  } catch (error) {
    console.error('Grup üyeleri güncellenemedi:', error);
    return NextResponse.json({ error: 'Grup üyeleri güncellenemedi' }, { status: 500 });
  }
}
