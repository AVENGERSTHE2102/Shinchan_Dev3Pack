import { NextResponse } from 'next/server';
import { payoutDare } from '@/lib/payout';

type HeliusEvent = {
  description?: string;
  logs?: string[];
  events?: {
    logMessages?: string[];
  };
  dare_id?: string;
  recipient?: string;
  bounty_usdc_cents?: number;
};

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function parseApprovalFromLogs(logs: string[]) {
  // Expected format from Anchor log emit helper:
  // SOLDRARE_APPROVAL::dare_id|recipient_wallet|bounty_usdc_cents
  const marker = logs.find((line) => line.includes('SOLDRARE_APPROVAL::'));
  if (!marker) return null;
  const payload = marker.split('SOLDRARE_APPROVAL::')[1];
  if (!payload) return null;
  const [dareId, recipient, centsText] = payload.split('|');
  const bountyUsdcCents = Number(centsText);
  if (!dareId || !recipient || !Number.isInteger(bountyUsdcCents) || bountyUsdcCents <= 0) {
    return null;
  }
  return { dareId, recipient, bountyUsdcCents };
}

function parseApprovalFallback(item: HeliusEvent) {
  if (item.dare_id) {
    return {
      dareId: item.dare_id,
      recipient: item.recipient,
      bountyUsdcCents: item.bounty_usdc_cents,
    };
  }

  const text = item.description ?? '';
  const uuidMatch = text.match(
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
  );
  if (!uuidMatch) return null;

  return {
    dareId: uuidMatch[0],
    recipient: item.recipient,
    bountyUsdcCents: item.bounty_usdc_cents,
  };
}

export async function POST(request: Request) {
  try {
    const secret = request.headers.get('x-helius-secret');
    if (secret !== required('HELIUS_WEBHOOK_SECRET')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as HeliusEvent[];
    for (const item of body) {
      const logs = item.events?.logMessages ?? item.logs ?? [];
      const parsed = parseApprovalFromLogs(logs) ?? parseApprovalFallback(item);
      if (!parsed) continue;

      await payoutDare({
        dareId: parsed.dareId,
        recipient: parsed.recipient,
        bountyUsdcCents: parsed.bountyUsdcCents,
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
