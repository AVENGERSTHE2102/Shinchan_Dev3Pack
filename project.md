# SolDare Project Blueprint

## Tech Stack
- **Smart Contract**: Rust, Anchor Framework, Solana Devnet
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui
- **Web3 Integration**: `@solana/wallet-adapter`, `@coral-xyz/anchor`
- **Backend/Database**: Supabase (PostgreSQL, Realtime subscriptions, Storage)
- **Payment Layer**: x402-next middleware, Coinbase CDP Facilitator
- **Index/RPC**: Helius Webhooks

## Directory Structure
```
/
├── programs/soldare/      # Rust Anchor Smart Contract
├── tests/                 # Anchor integration tests (Mocha/Chai)
├── app/                   # Next.js Application (Frontend + API Routes)
│   ├── app/               # App Router pages and API routes
│   ├── components/        # React UI components
│   ├── hooks/             # Custom React hooks for Anchor/Supabase
│   ├── lib/               # Utility functions, x402 config, Supabase client
│   └── idl/               # Auto-generated Anchor IDL (JSON)
├── supabase/              # Database schema SQL files
├── docs/                  # Architecture and Demo scripts
└── .env                   # Environment variables
```

## Required Environment Variables
To run this project, the `.env` file must contain:
```env
# Solana
NEXT_PUBLIC_PROGRAM_ID="your_deployed_program_id"
NEXT_PUBLIC_RPC_URL="https://api.devnet.solana.com" # Or Helius RPC
HELIUS_API_KEY="your_helius_key"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_key" # DO NOT leak this

# x402 & Treasury
COINBASE_CDP_API_KEY="your_cdp_key"
TREASURY_SECRET_KEY="your_treasury_wallet_private_key_array"
USDC_MINT_ADDRESS="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU" # Devnet USDC
```

## Core Workflows
1. **Create Dare**: `Creator UI -> Supabase Insert -> Anchor create_dare TX -> Shareable Link`
2. **Accept Dare**: `Recipient UI -> Supabase Update -> Anchor accept_dare TX`
3. **Approve & Payout**: `Creator UI -> Anchor approve_dare TX -> Helius Webhook -> Next.js /api/dare/payout -> x402 USDC Transfer`
