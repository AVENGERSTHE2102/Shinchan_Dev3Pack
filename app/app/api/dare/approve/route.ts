import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { payoutDare } from '@/lib/payout';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dare_id, recipient, bounty_usdc_cents, approve_tx } = body ?? {};

    if (!dare_id || !recipient || !bounty_usdc_cents) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin
      .from('dares')
      .update({
        status: 'approved',
        recipient_wallet: recipient,
        onchain_tx_approve: approve_tx ?? null,
      })
      .eq('id', dare_id);

    const result = await payoutDare({
      dareId: dare_id,
      recipient,
      bountyUsdcCents: Number(bounty_usdc_cents),
    });

    return NextResponse.json(
      { ok: true, payout_tx: result.payoutTx, cached: result.cached },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
