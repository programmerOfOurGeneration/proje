import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
  }

  // Kullanıcının admin olup olmadığını kontrol et
  const user = await prisma.kullanici.findUnique({
    where: {
      email: session.user.email,
    },
  })

  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })
  }

  try {
    const icerik = await prisma.anaSayfaIcerik.findFirst({
      include: {
        servisler: true,
        istatistikler: true,
      },
    })
    
    return NextResponse.json(icerik)
  } catch (error) {
    console.error('İçerik alınamadı:', error)
    return NextResponse.json({ error: 'İçerik alınamadı' }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
  }

  // Kullanıcının admin olup olmadığını kontrol et
  const user = await prisma.kullanici.findUnique({
    where: {
      email: session.user.email,
    },
  })

  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })
  }

  // Request body validation
  const data = await request.json()
  if (!data.heroBaslik || !data.heroAltBaslik) {
    return NextResponse.json({ error: 'Hero başlık ve alt başlık zorunludur' }, { status: 400 })
  }

  // Validate services array
  if (!Array.isArray(data.servisler) || !data.servisler.every(s => s.baslik && s.aciklama)) {
    return NextResponse.json({ error: 'Geçersiz servis verileri' }, { status: 400 })
  }

  // Validate statistics array
  if (!Array.isArray(data.istatistikler) || !data.istatistikler.every(i => i.rakam && i.aciklama)) {
    return NextResponse.json({ error: 'Geçersiz istatistik verileri' }, { status: 400 })
  }  try {
    // Update or create content in a single transaction
    const icerik = await prisma.$transaction(async (prisma) => {
      const existingContent = await prisma.anaSayfaIcerik.findFirst();
      
      if (existingContent) {
        // Delete related records first
        await prisma.servis.deleteMany({
          where: { anaSayfaId: existingContent.id }
        });
        
        await prisma.istatistik.deleteMany({
          where: { anaSayfaId: existingContent.id }
        });
        
        // Update the content
        return await prisma.anaSayfaIcerik.update({
          where: { id: existingContent.id },
          data: {
            heroBaslik: data.heroBaslik,
            heroAltBaslik: data.heroAltBaslik,
            servisler: {
              create: data.servisler.map(servis => ({
                baslik: servis.baslik,
                aciklama: servis.aciklama,
                ikonUrl: servis.ikonUrl
              }))
            },
            istatistikler: {
              create: data.istatistikler.map(istatistik => ({
                rakam: istatistik.rakam,
                aciklama: istatistik.aciklama
              }))
            }
          },
          include: {
            servisler: true,
            istatistikler: true
          }
        });
      } else {
        // Create new content
        return await prisma.anaSayfaIcerik.create({
          data: {
            heroBaslik: data.heroBaslik,
            heroAltBaslik: data.heroAltBaslik,
            servisler: {
              create: data.servisler.map(servis => ({
                baslik: servis.baslik,
                aciklama: servis.aciklama,
                ikonUrl: servis.ikonUrl
              }))
            },
            istatistikler: {
              create: data.istatistikler.map(istatistik => ({
                rakam: istatistik.rakam,
                aciklama: istatistik.aciklama
              }))
            }
          },
          include: {
            servisler: true,
            istatistikler: true
          }
        });
      }
    });
    
    return NextResponse.json(icerik)
  } catch (error) {
    console.error('İçerik güncellenemedi:', error)
    return NextResponse.json({ error: 'İçerik güncellenemedi' }, { status: 500 })
  }
}
