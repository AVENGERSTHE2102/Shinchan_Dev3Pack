import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { getSupabaseAdmin } from '@/lib/supabase';

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function centsToRawUsdc(cents: number) {
  return BigInt(cents) * 10_000n;
}

function getConnection() {
  return new Connection(required('HELIUS_RPC_URL'), 'confirmed');
}

function getTreasury() {
  const secret = JSON.parse(required('TREASURY_SECRET_KEY')) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

function getUsdcMint() {
  return new PublicKey(required('USDC_MINT'));
}

export async function payoutDare(params: {
  dareId: string;
  recipient?: string;
  bountyUsdcCents?: number;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: dare, error } = await supabaseAdmin
    .from('dares')
    .select('id,payout_tx,recipient_wallet,bounty_usdc_cents,status')
    .eq('id', params.dareId)
    .single();

  if (error || !dare) throw new Error('Dare not found');

  if (dare.payout_tx) {
    const cents = Number(params.bountyUsdcCents ?? dare.bounty_usdc_cents ?? 0);
    return {
      payoutTx: dare.payout_tx,
      cached: true,
      payoutAmountRaw: centsToRawUsdc(cents).toString(),
    };
  }

  const recipientWallet = params.recipient ?? dare.recipient_wallet;
  const bountyUsdcCents = Number(params.bountyUsdcCents ?? dare.bounty_usdc_cents ?? 0);
  if (!recipientWallet) throw new Error('recipient wallet missing');
  if (!Number.isInteger(bountyUsdcCents) || bountyUsdcCents <= 0) {
    throw new Error('invalid bounty_usdc_cents');
  }
  if (dare.status !== 'approved' && dare.status !== 'proof_submitted') {
    throw new Error(`dare not eligible for payout, current status: ${dare.status}`);
  }

  const connection = getConnection();
  const treasury = getTreasury();
  const usdcMint = getUsdcMint();
  const recipientPk = new PublicKey(recipientWallet);
  const amountRaw = centsToRawUsdc(bountyUsdcCents);

  const treasuryAta = await getAssociatedTokenAddress(usdcMint, treasury.publicKey);
  const treasuryUsdc = await getAccount(connection, treasuryAta);
  if (treasuryUsdc.amount < 5_000_000n) {
    console.warn('Treasury USDC below $5. Top up before demo.');
  }

  const recipientAta = await getAssociatedTokenAddress(usdcMint, recipientPk);
  let createRecipientAtaIx:
    | ReturnType<typeof createAssociatedTokenAccountInstruction>
    | null = null;
  try {
    await getAccount(connection, recipientAta);
  } catch {
    createRecipientAtaIx = createAssociatedTokenAccountInstruction(
      treasury.publicKey,
      recipientAta,
      recipientPk,
      usdcMint,
    );
  }

  const tx = new Transaction();
  if (createRecipientAtaIx) tx.add(createRecipientAtaIx);
  tx.add(
    createTransferInstruction(
      treasuryAta,
      recipientAta,
      treasury.publicKey,
      Number(amountRaw),
    ),
  );
  tx.feePayer = treasury.publicKey;

  const payoutTx = await sendAndConfirmTransaction(connection, tx, [treasury], {
    commitment: 'confirmed',
  });

  const { error: updateError } = await supabaseAdmin
    .from('dares')
    .update({
      payout_tx: payoutTx,
      payout_amount_raw: amountRaw.toString(),
      paid_at: new Date().toISOString(),
      status: 'paid',
    })
    .eq('id', params.dareId)
    .is('payout_tx', null);

  if (updateError) {
    throw new Error(`Payout sent but DB update failed: ${updateError.message}`);
  }

  return {
    payoutTx,
    cached: false,
    payoutAmountRaw: amountRaw.toString(),
  };
}
