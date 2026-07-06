import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './auth'

export function middleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register']
  
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isPublicPath) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/drivers/:path*',
    '/vehicles/:path*',
    '/documents/:path*',
    '/accounting/:path*',
    '/reports/:path*',
    '/driver-portal/:path*',
    '/api/:path*',
  ],
}
