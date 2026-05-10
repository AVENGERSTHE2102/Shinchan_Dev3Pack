import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dare_id, recipient, bounty_lamports, approve_tx } = body ?? {};

    if (!dare_id || !recipient || !bounty_lamports) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // In the SOL version, the on-chain approve_dare instruction 
    // already handles the payout. We just record the success in DB.
    const { error } = await supabaseAdmin
      .from('dares')
      .update({
        status: 'paid',
        recipient_wallet: recipient,
        onchain_tx_approve: approve_tx ?? null,
        paid_at: new Date().toISOString(),
      })
      .eq('id', dare_id);

    if (error) throw error;

    return NextResponse.json(
      { ok: true, message: 'Dare approved and status updated to paid' },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
