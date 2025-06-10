import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const kullanici = await prisma.kullanici.findUnique({
      where: {
        email: session.user.email
      }
    });

    const digerKullaniciId = parseInt(params.id);
    if (isNaN(digerKullaniciId)) {
      return NextResponse.json({ error: 'Geçersiz ID' }, { status: 400 });
    }

    // Mesajları getir (gönderilen ve alınan)
    const mesajlar = await prisma.ozelMesaj.findMany({
      where: {
        OR: [
          {
            AND: [
              { gonderenId: kullanici.id },
              { aliciId: digerKullaniciId }
            ]
          },
          {
            AND: [
              { gonderenId: digerKullaniciId },
              { aliciId: kullanici.id }
            ]
          }
        ]
      },
      include: {
        gonderen: {
          select: {
            id: true,
            isim: true,
            email: true,
            resim: true
          }
        },
        alici: {
          select: {
            id: true,
            isim: true,
            email: true,
            resim: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Okunmamış mesajları okundu olarak işaretle
    if (mesajlar.length > 0) {
      await prisma.ozelMesaj.updateMany({
        where: {
          aliciId: kullanici.id,
          gonderenId: digerKullaniciId,
          okundu: false
        },
        data: {
          okundu: true
        }
      });
    }

    return NextResponse.json(mesajlar);
  } catch (error) {
    console.error('Mesajlar alınamadı:', error);
    return NextResponse.json({ error: 'Mesajlar alınamadı' }, { status: 500 });
  }
}
