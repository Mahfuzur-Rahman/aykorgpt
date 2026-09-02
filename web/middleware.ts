import { NextResponse, type NextRequest } from 'next/server'

// Auth is handled entirely client-side via our own session (lib/session.ts)
// and enforced by the API, so the middleware is a pass-through. We no longer
// use Supabase Auth cookies here.
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
