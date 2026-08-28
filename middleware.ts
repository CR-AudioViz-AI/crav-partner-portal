import { createClient } from '@supabase/supabase-js'
import { track } from '@/lib/analytics/track'
import { NextResponse, type NextFetchEvent } from 'next/server'
import type { NextRequest } from 'next/server'
import { publishableKey, supabaseUrl } from "@craudioviz/platform-sdk";

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  // 2026-08-16: this middleware has five return paths and no shared response
  // object, so tracking runs at the top before any branch. Every request is
  // logged whether it is served, redirected to login, or rejected.
  try {
    event.waitUntil(track({
      path: request.nextUrl.pathname,
      method: request.method,
      userAgent: request.headers.get('user-agent') ?? '',
      referrer: request.headers.get('referer'),
      ip: (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || null,
      country: request.headers.get('x-vercel-ip-country'),
      appId: request.nextUrl.hostname,
      sessionId: request.cookies.get('zsid')?.value ?? null,
      userId: null,
    }))
  } catch {
    // Never let tracking break a request.
  }

  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  // 2026-08-16: /robots.txt and /sitemap.xml were missing here, so the auth
  // gate redirected every crawler to the login page. Googlebot asking for
  // robots.txt received 'Redirecting...' and indexed nothing. Crawl surfaces
  // are public by definition — a sitemap behind a login is not a sitemap.
  const publicRoutes = [
    '/', '/auth/login', '/auth/register', '/auth/callback',
    '/robots.txt', '/sitemap.xml', '/manifest.json', '/favicon.ico',
  ]
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token in cookies
  const SUPABASE_URL = supabaseUrl()
  const supabaseAnonKey = publishableKey()
  
  // Get the auth token from cookies
  const authCookie = request.cookies.get('sb-kteobfyferrukqeolofj-auth-token')
  
  if (!authCookie) {
    // Redirect to login if no auth cookie
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    const supabase = createClient(SUPABASE_URL, supabaseAnonKey)
    const { data: { user }, error } = await supabase.auth.getUser(authCookie.value)

    if (error || !user) {
      // Clear invalid cookie and redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.delete('sb-kteobfyferrukqeolofj-auth-token')
      return response
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware auth error:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
