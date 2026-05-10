create extension if not exists pgcrypto;

create table if not exists public.dares (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    creator_wallet text not null,
    recipient_wallet text,
    dare_text text not null,
    bounty_lamports bigint not null check (bounty_lamports > 0),
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

create table if not exists public.dare_contacts (
    dare_id uuid primary key references public.dares(id) on delete cascade,
    creator_email text,
    recipient_email text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint creator_email_format check (
      creator_email is null or creator_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    ),
    constraint recipient_email_format check (
      recipient_email is null or recipient_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    )
);

alter table public.dare_contacts
  add column if not exists dare_id uuid,
  add column if not exists creator_email text,
  add column if not exists recipient_email text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'dare_contacts_pkey'
  ) then
    alter table public.dare_contacts add primary key (dare_id);
  end if;
exception
  when duplicate_table then null;
  when duplicate_object then null;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'dare_contacts_dare_id_fkey'
  ) then
    alter table public.dare_contacts
      add constraint dare_contacts_dare_id_fkey
      foreign key (dare_id) references public.dares(id) on delete cascade;
  end if;
exception
  when duplicate_object then null;
end
$$;

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

drop trigger if exists trg_dare_contacts_updated_at on public.dare_contacts;
create trigger trg_dare_contacts_updated_at
before update on public.dare_contacts
for each row execute function public.set_updated_at();

create index if not exists idx_dares_creator_wallet on public.dares(creator_wallet);
create index if not exists idx_dares_recipient_wallet on public.dares(recipient_wallet);
create index if not exists idx_dares_status on public.dares(status);
create index if not exists idx_dare_contacts_creator_email on public.dare_contacts(creator_email);
create index if not exists idx_dare_contacts_recipient_email on public.dare_contacts(recipient_email);

alter table public.dares enable row level security;
drop policy if exists "public read dares" on public.dares;
create policy "public read dares" on public.dares for select using (true);

alter table public.dare_contacts enable row level security;

insert into public.dare_contacts (dare_id, creator_email, recipient_email)
select
  d.id,
  nullif(d.metadata ->> 'creator_email', ''),
  nullif(d.metadata ->> 'recipient_email', '')
from public.dares d
where
  (d.metadata ? 'creator_email' or d.metadata ? 'recipient_email')
on conflict (dare_id) do update
set
  creator_email = excluded.creator_email,
  recipient_email = excluded.recipient_email,
  updated_at = now();
