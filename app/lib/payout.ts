import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { getSupabaseAdmin } from '@/lib/supabase';

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function getConnection() {
  return new Connection(required('HELIUS_RPC_URL'), 'confirmed');
}

function getTreasury() {
  const secret = JSON.parse(required('TREASURY_SECRET_KEY')) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

/**
 * Payouts SOL to the recipient.
 * Note: Primary payout is handled on-chain by the approveDare instruction.
 * This helper can be used for manual or fallback payouts.
 */
export async function payoutDare(params: {
  dareId: string;
  recipient?: string;
  bountyLamports?: number;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: dare, error } = await supabaseAdmin
    .from('dares')
    .select('*')
    .eq('id', params.dareId)
    .single();

  if (error || !dare) throw new Error('Dare not found');

  if (dare.status === 'paid' && dare.payout_tx) {
    return {
      payoutTx: dare.payout_tx,
      cached: true,
      payoutAmountLamports: dare.bounty_lamports,
    };
  }

  const recipientWallet = params.recipient ?? dare.recipient_wallet;
  const bountyLamports = Number(params.bountyLamports ?? dare.bounty_lamports ?? 0);

  if (!recipientWallet) throw new Error('Recipient wallet missing');
  if (bountyLamports <= 0) throw new Error('Invalid bounty amount');

  const connection = getConnection();
  const treasury = getTreasury();
  const recipientPk = new PublicKey(recipientWallet);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: treasury.publicKey,
      toPubkey: recipientPk,
      lamports: BigInt(bountyLamports),
    }),
  );

  const payoutTx = await sendAndConfirmTransaction(connection, tx, [treasury], {
    commitment: 'confirmed',
  });

  await supabaseAdmin
    .from('dares')
    .update({
      payout_tx: payoutTx,
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('id', params.dareId);

  return {
    payoutTx,
    cached: false,
    payoutAmountLamports: bountyLamports,
  };
}
