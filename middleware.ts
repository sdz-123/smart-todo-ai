// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // 保护需要认证的路由
  if (!session && req.nextUrl.pathname.startsWith('/api/tasks')) {
    return new NextResponse(
      JSON.stringify({ success: false, error: '未登录' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    )
  }
  
  return res
}

export const config = {
  matcher: ['/api/:path*'],
}