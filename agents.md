# SolDare Agent Roles & Workflow

This repository is designed to be built collaboratively by multiple AI agents (or human developers) acting in specific roles.

## The Roles

### 🦀 P1 (Rust Developer)
- **Domain**: `programs/soldare/` and `tests/soldare.ts`
- **Tech Stack**: Rust, Anchor, Solana CLI.
- **Responsibility**: Write the secure smart contract (DareAccount PDA, instructions), deploy to devnet, export the IDL, and write the integration tests. 
- **Status**: ✅ Code complete. Waiting on devnet deployment.

### 🎨 P2 (Frontend Developer)
- **Domain**: `app/app/`, `app/components/`, `app/hooks/`
- **Tech Stack**: Next.js 14, Tailwind, React, `@solana/wallet-adapter`.
- **Responsibility**: Build the UI. Ensure a premium look. Create the gasless dare experience for the recipient.
- **Status**: ⏳ Pending (Blocked by P4 deployment/IDL).

### ⚙️ P3 (x402 & Backend Developer)
- **Domain**: `app/app/api/`, `supabase/`, `app/lib/`
- **Tech Stack**: Node, Supabase, `x402-next`, Helius Webhooks.
- **Responsibility**: Wire the Supabase database. Handle the off-chain x402 USDC payout logic when a dare is approved.
- **Status**: ⏳ Pending (Can start Supabase routes now).

### 🎬 P4 (Integration & Demo Lead)
- **Domain**: Entire codebase, `progress.md`, `Readme.md`.
- **Tech Stack**: Vercel, OBS, Git.
- **Responsibility**: Physically compile and deploy the Rust code to Devnet. Export the IDL. Test the end-to-end flow. Record the demo video. Write the final judging README.
- **Status**: 🔴 Active Blocker. Needs to deploy the contract.

---

## The Workflow Protocol (`progress.md`)
To prevent agents from overwriting each other or losing context, all agents **MUST** follow this protocol:

1. **Start of Session**: Read `progress.md` to see what has been completed, what is currently being worked on, and what blockers exist.
2. **Implementation**: Execute your specific role's tasks according to the implementation plans. Do not touch files outside your domain unless necessary for integration.
3. **End of Session**: Append an update to `progress.md`. You must explicitly state:
   - What you accomplished.
   - What your next steps are.
   - **Who/What is blocking you.** (e.g., "P2 is blocked by P3: Supabase route not returning UUID").
