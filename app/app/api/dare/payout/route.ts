import { NextResponse } from 'next/server';
import { payoutDare } from '@/lib/payout';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dare_id, recipient, bounty_lamports } = body ?? {};

    if (!dare_id) {
      return NextResponse.json(
        { ok: false, error: 'Missing required field: dare_id' },
        { status: 400 },
      );
    }

    // This is the fallback payout logic (SOL-based)
    const result = await payoutDare({
      dareId: dare_id,
      recipient,
      bountyLamports:
        bounty_lamports !== undefined ? Number(bounty_lamports) : undefined,
    });

    return NextResponse.json(
      {
        ok: true,
        payout_tx: result.payoutTx,
        payout_amount_raw: result.payoutAmountLamports,
        cached: result.cached,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
