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

  try {
    const data = await request.json()
    
    const icerik = await prisma.anaSayfaIcerik.upsert({
      where: {
        id: 1,
      },
      update: {
        heroBaslik: data.heroBaslik,
        heroAltBaslik: data.heroAltBaslik,
        servisler: {
          deleteMany: {},
          create: data.servisler,
        },
        istatistikler: {
          deleteMany: {},
          create: data.istatistikler,
        },
      },
      create: {
        heroBaslik: data.heroBaslik,
        heroAltBaslik: data.heroAltBaslik,
        servisler: {
          create: data.servisler,
        },
        istatistikler: {
          create: data.istatistikler,
        },
      },
    })
    
    return NextResponse.json(icerik)
  } catch (error) {
    console.error('İçerik güncellenemedi:', error)
    return NextResponse.json({ error: 'İçerik güncellenemedi' }, { status: 500 })
  }
}
