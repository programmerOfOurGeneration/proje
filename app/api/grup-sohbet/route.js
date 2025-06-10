import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// Grupları listele
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const kullanici = await prisma.kullanici.findUnique({
      where: { email: session.user.email }
    });

    // Admin tüm grupları görür, normal kullanıcılar sadece üye oldukları grupları görür
    const gruplar = await prisma.sohbetGrubu.findMany({
      where: kullanici.isAdmin ? 
        {} : // Admin tüm grupları görür
        {
          uyeler: {
            some: {
              uyeId: kullanici.id
            }
          }
        },
      include: {
        olusturan: {
          select: {
            id: true,
            isim: true,
            email: true
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

    return NextResponse.json(gruplar);
  } catch (error) {
    console.error('Gruplar listelenemedi:', error);
    return NextResponse.json({ error: 'Gruplar listelenemedi' }, { status: 500 });
  }
}

// Yeni grup oluştur
export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const kullanici = await prisma.kullanici.findUnique({
      where: { email: session.user.email }
    });

    if (!kullanici.isAdmin) {
      return NextResponse.json({ error: 'Sadece adminler grup oluşturabilir' }, { status: 403 });
    }

    const { isim, aciklama, uyeIdleri } = await request.json();

    const grup = await prisma.sohbetGrubu.create({
      data: {
        isim,
        aciklama,
        olusturanId: kullanici.id,
        uyeler: {
          create: uyeIdleri.map(uyeId => ({
            uye: { connect: { id: uyeId } }
          }))
        }
      },
      include: {
        olusturan: true,
        uyeler: {
          include: {
            uye: true
          }
        }
      }
    });

    return NextResponse.json(grup);
  } catch (error) {
    console.error('Grup oluşturulamadı:', error);
    return NextResponse.json({ error: 'Grup oluşturulamadı' }, { status: 500 });
  }
}
