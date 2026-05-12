import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // No env vars — let through but block dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // Validate session server-side
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Redirect unauthenticated from /dashboard to /auth/login
  if (pathname.startsWith('/dashboard') && !user) {
    const loginUrl = new URL('/auth/login', request.url)
    const redirectRes = NextResponse.redirect(loginUrl)
    response.cookies.getAll().forEach(c =>
      redirectRes.cookies.set(c.name, c.value, { path: '/' })
    )
    return redirectRes
  }

  // Redirect authenticated away from /auth/login to /dashboard
  if (user && pathname === '/auth/login') {
    const dashUrl = new URL('/dashboard', request.url)
    const redirectRes = NextResponse.redirect(dashUrl)
    response.cookies.getAll().forEach(c =>
      redirectRes.cookies.set(c.name, c.value, { path: '/' })
    )
    return redirectRes
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
