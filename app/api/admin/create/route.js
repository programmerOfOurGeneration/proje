import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const { email, password, name } = await request.json()

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10)

    // Kullanıcı var mı diye kontrol et
    const existingUser = await prisma.kullanici.findUnique({
      where: { email },
    })

    if (existingUser) {
      // Kullanıcı varsa, admin yap ve şifresini güncelle
      const updatedUser = await prisma.kullanici.update({
        where: { email },
        data: {
          isAdmin: true,
          password: hashedPassword,
          isim: name,
        },
      })
      return NextResponse.json(updatedUser)
    }

    // Yeni admin kullanıcı oluştur
    const newUser = await prisma.kullanici.create({
      data: {
        email,
        password: hashedPassword,
        isim: name,
        isAdmin: true,
      },
    })

    return NextResponse.json(newUser)
  } catch (error) {
    console.error('Admin oluşturma hatası:', error)
    return NextResponse.json({ error: 'Admin oluşturulamadı' }, { status: 500 })
  }
}
