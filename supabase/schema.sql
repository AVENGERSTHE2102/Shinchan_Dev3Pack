-- SolDare Database Schema

-- Dares table
CREATE TABLE dares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    creator_pubkey TEXT NOT NULL,
    recipient_pubkey TEXT,
    dare_text TEXT NOT NULL,
    dare_hash TEXT NOT NULL,
    bounty_lamports BIGINT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'approved', 'expired')) NOT NULL,
    proof_url TEXT,
    proof_hash TEXT,
    tx_signature TEXT
);

-- Index for faster lookups
CREATE INDEX idx_dares_creator_pubkey ON dares(creator_pubkey);
CREATE INDEX idx_dares_dare_hash ON dares(dare_hash);
