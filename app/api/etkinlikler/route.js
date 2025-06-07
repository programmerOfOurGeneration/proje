import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const events = await prisma.etkinlik.findMany({
      orderBy: {
        tarih: 'desc',
      },
    })
    
    return NextResponse.json(events)
  } catch (error) {
    console.error('Etkinlikler alınamadı:', error)
    return NextResponse.json({ error: 'Etkinlikler alınamadı' }, { status: 500 })
  }
}
