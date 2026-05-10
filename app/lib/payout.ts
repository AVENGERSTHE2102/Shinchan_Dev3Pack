import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * After approveDare is called on-chain, the smart contract directly
 * transfers the locked SOL from the PDA to the recipient.
 * This function only updates the DB to record the approval and
 * marks the dare as paid (using the on-chain approve_tx as the payout proof).
 */
export async function payoutDare(params: {
  dareId: string;
  recipient?: string;
  bountyLamports?: number;
  approveTx?: string;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: dare, error } = await supabaseAdmin
    .from('dares')
    .select('id,payout_tx,recipient_wallet,bounty_lamports,status')
    .eq('id', params.dareId)
    .single();

  if (error || !dare) throw new Error('Dare not found');

  // Already paid — idempotent
  if (dare.payout_tx) {
    return {
      payoutTx: dare.payout_tx,
      cached: true,
      payoutAmountRaw: dare.bounty_lamports?.toString() ?? '0',
    };
  }

  const bountyLamports = Number(params.bountyLamports ?? dare.bounty_lamports ?? 0);
  // The on-chain approveDare tx IS the payout tx (SOL moved directly on-chain)
  const payoutTx = params.approveTx ?? 'on-chain';

  const { error: updateError } = await supabaseAdmin
    .from('dares')
    .update({
      payout_tx: payoutTx,
      payout_amount_raw: bountyLamports.toString(),
      status: 'paid',
    })
    .eq('id', params.dareId)
    .is('payout_tx', null);

  if (updateError) {
    console.error(`DB update failed after on-chain payout: ${updateError.message}`);
  }

  return {
    payoutTx,
    cached: false,
    payoutAmountRaw: bountyLamports.toString(),
  };
}
