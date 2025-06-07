import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request) {
  const token = await getToken({ req: request })
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Admin kontrolü için API çağrısı
    const userResponse = await fetch(`${request.nextUrl.origin}/api/admin/check`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    })
    
    if (!userResponse.ok) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
