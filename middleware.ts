import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('session')?.value

  // Public routes
  if (pathname === '/login' || pathname === '/') {
    if (token) {
      const session = await verifySession(token)
      if (session) {
        if (session.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url))
        }
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    return NextResponse.next()
  }

  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const session = await verifySession(token)
    if (!session || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  // Protected coordinator routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const session = await verifySession(token)
    if (!session || session.role !== 'coordinator') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/dashboard/:path*'],
}
