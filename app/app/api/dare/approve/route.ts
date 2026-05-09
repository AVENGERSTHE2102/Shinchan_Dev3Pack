import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Logic called after on-chain approve tx
  return NextResponse.json({ success: true })
}
