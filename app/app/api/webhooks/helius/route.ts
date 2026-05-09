import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Logic to catch ApprovalEvent from chain
  return NextResponse.json({ success: true })
}
