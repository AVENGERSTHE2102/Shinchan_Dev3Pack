import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

type HeliusEvent = {
  description?: string;
  logs?: string[];
  events?: {
    logMessages?: string[];
  };
};

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function parseApprovalFromLogs(logs: string[]) {
  // Expected format from Anchor ApprovalEvent emit:
  // Program log: Instruction: ApproveDare
  // Program log: ApprovalEvent { dare_id: "...", recipient: "...", bounty_lamports: ... }
  
  // We'll look for the dare_id in the logs
  const dareIdLine = logs.find((line) => line.includes('dare_id'));
  if (!dareIdLine) return null;
  
  const uuidMatch = dareIdLine.match(
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
  );
  
  if (!uuidMatch) return null;
  return { dareId: uuidMatch[0] };
}

export async function POST(request: Request) {
  try {
    const secret = request.headers.get('x-helius-secret');
    if (secret !== required('HELIUS_WEBHOOK_SECRET')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as HeliusEvent[];
    const supabaseAdmin = getSupabaseAdmin();

    for (const item of body) {
      const logs = item.events?.logMessages ?? item.logs ?? [];
      const parsed = parseApprovalFromLogs(logs);
      if (!parsed) continue;

      // Sync status to Supabase if it wasn't already updated by the frontend
      await supabaseAdmin
        .from('dares')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', parsed.dareId)
        .is('paid_at', null); // Only update if not already marked paid
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
