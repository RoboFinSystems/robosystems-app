import type { SidebarCookie } from '@/lib/core'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { isCollapsed } = (await req.json()) as SidebarCookie

  // Set the cookie with proper options
  const cookieStore = await cookies()
  cookieStore.set('sidebar-collapsed', String(isCollapsed), {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return Response.json({ success: true })
}
