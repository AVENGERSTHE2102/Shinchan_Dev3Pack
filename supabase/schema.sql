create extension if not exists pgcrypto;

create table if not exists public.dares (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    creator_wallet text not null,
    recipient_wallet text,
    dare_text text not null,
    bounty_usdc_cents integer not null check (bounty_usdc_cents > 0),
    expires_at timestamptz not null,
    status text not null default 'created' check (status in ('created', 'accepted', 'proof_submitted', 'approved', 'paid', 'expired', 'reclaimed')),
    proof_url text,
    onchain_dare_pda text,
    onchain_tx_create text,
    onchain_tx_approve text,
    payout_tx text,
    payout_amount_raw text,
    paid_at timestamptz,
    metadata jsonb not null default '{}'::jsonb
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_dares_updated_at on public.dares;
create trigger trg_dares_updated_at
before update on public.dares
for each row execute function public.set_updated_at();

create index if not exists idx_dares_creator_wallet on public.dares(creator_wallet);
create index if not exists idx_dares_recipient_wallet on public.dares(recipient_wallet);
create index if not exists idx_dares_status on public.dares(status);

alter table public.dares enable row level security;
drop policy if exists "public read dares" on public.dares;
create policy "public read dares" on public.dares for select using (true);
