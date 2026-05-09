import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      creator_wallet,
      recipient_wallet,
      dare_text,
      bounty_usdc_cents,
      expires_at,
    } =
      body ?? {};

    if (!creator_wallet || !dare_text || !bounty_usdc_cents || !expires_at) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('dares')
      .insert({
        creator_wallet,
        recipient_wallet: recipient_wallet ?? null,
        dare_text,
        bounty_usdc_cents: Number(bounty_usdc_cents),
        expires_at,
        status: 'created',
      })
      .select('id,status')
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ...data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
