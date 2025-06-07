import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const messages = await prisma.mesaj.findMany({
      include: {
        kullanici: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })
    
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Mesajlar alınamadı:', error)
    return NextResponse.json({ error: 'Mesajlar alınamadı' }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 })
  }

  try {
    const { message } = await request.json()
    
    const newMessage = await prisma.mesaj.create({
      data: {
        icerik: message,
        kullanici: {
          connectOrCreate: {
            where: { email: session.user.email },
            create: {
              email: session.user.email,
              isim: session.user.name,
              resim: session.user.image,
            },
          },
        },
      },
      include: {
        kullanici: true,
      },
    })
    
    return NextResponse.json(newMessage)
  } catch (error) {
    console.error('Mesaj gönderilemedi:', error)
    return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 })
  }
}
