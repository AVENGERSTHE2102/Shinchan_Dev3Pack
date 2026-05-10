import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      creator_wallet,
      recipient_wallet,
      title,
      description,
      bounty_lamports,
      expires_at,
      dare_hash,
    } =
      body ?? {};

    if (!creator_wallet || !title || !bounty_lamports || !expires_at || !dare_hash) {
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
        dare_text: title + "\n" + description, // Combine for backward compatibility if needed
        bounty_lamports: Number(bounty_lamports),
        expires_at,
        status: 'created',
        metadata: { title, description, dare_hash }, // Store hash in metadata for now if column missing
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
