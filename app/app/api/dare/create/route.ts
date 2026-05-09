import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Logic to insert dare into Supabase
  return NextResponse.json({ success: true })
}
