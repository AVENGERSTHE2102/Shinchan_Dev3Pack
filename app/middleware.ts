import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // x402 middleware logic placeholder
  return NextResponse.next()
}

export const config = {
  matcher: '/api/dare/payout/:path*',
}
