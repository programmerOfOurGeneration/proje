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

    const kullaniciId = parseInt(params.id);
    
    // Mevcut kullanıcıyı bul
    const currentUser = await prisma.kullanici.findUnique({
      where: {
        email: session.user.email
      }
    });

    // İki yönlü mesajları getir (gönderilen ve alınan)
    const mesajlar = await prisma.ozelMesaj.findMany({
      where: {
        OR: [
          { 
            AND: [
              { gonderenId: currentUser.id },
              { aliciId: kullaniciId }
            ]
          },
          { 
            AND: [
              { gonderenId: kullaniciId },
              { aliciId: currentUser.id }
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
    await prisma.ozelMesaj.updateMany({
      where: {
        aliciId: currentUser.id,
        gonderenId: kullaniciId,
        okundu: false
      },
      data: {
        okundu: true
      }
    });

    return NextResponse.json(mesajlar);
  } catch (error) {
    console.error('Mesajlar getirilemedi:', error);
    return NextResponse.json({ error: 'Mesajlar getirilemedi' }, { status: 500 });
  }
}
