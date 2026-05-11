import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars missing, allow request through — don't crash middleware
  if (!supabaseUrl || !supabaseKey) {
    console.error('[middleware] Missing Supabase env vars — check Vercel environment variables')
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  // getUser() validates JWT on Supabase server — required for auth to work
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protect /dashboard — redirect unauthenticated to login
  if (pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    const redirectRes = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(c =>
      redirectRes.cookies.set(c.name, c.value, { path: '/' })
    )
    return redirectRes
  }

  // Redirect authenticated users away from login page
  if (user && pathname === '/auth/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    const redirectRes = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(c =>
      redirectRes.cookies.set(c.name, c.value, { path: '/' })
    )
    return redirectRes
  }

  return supabaseResponse
}
