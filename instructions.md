# AI Agent Instructions for SolDare (P2, P3, & P4 Implementation)

**Context:** You are picking up the development of **SolDare**, a decentralized platform for social dares built on Solana. The smart contract (Anchor/Rust) has been entirely completed by the previous agent (P1). 

**Your Goal:** Your task is to act as **P2 (Frontend)**, **P3 (x402 Backend)**, and **P4 (Integration & Demo)**. You will be building the Next.js application, integrating the Supabase database, wiring up the UI to the Anchor program, and handling final integration testing.

---

## The Golden Rule: The `progress.md` Workflow
Before you write any code, you **MUST** read the `progress.md` file in the root directory. 
- It acts as the baton pass between agents.
- It tells you exactly what has been completed and what is currently blocking the project.
- **When you finish your implementation (or hit a wall), you must append your own update to `progress.md`.**
- You must explicitly state what you accomplished, what your next steps are, and **who/what is currently blocking your implementation** (e.g., "Blocked by User: Need real Program ID", "Blocked by P3: API route failing").

---

## What Has Been Completed by P1 (Do Not Touch)
- **Anchor Program (`programs/soldare/src/lib.rs`)**: 100% complete, bug-free, and frozen. Contains 4 instructions (`create_dare`, `accept_dare`, `approve_dare`, `reclaim`).
- **Tests (`tests/soldare.ts`)**: Integration tests are complete.
- **Root Configurations**: `.gitignore`, `Anchor.toml`, `Cargo.toml` are finalized.
- **Next.js Scaffolding**: Basic empty file shells have been created in `app/`. 

---

## Your Responsibilities (Next Tasks)

### 1. P3 (Supabase & Database Sync)
- **Database Schema**: Review `supabase/schema.sql`. Ensure it aligns with the data you need for the frontend.
- **API Routes (`app/app/api/`)**:
  - Implement `/api/dare/create/route.ts`: Inserts a new dare into Supabase and returns a UUID for the shareable link.
  - Implement `/api/dare/payout/route.ts`: The x402 middleware route that triggers the USDC transfer when a dare is approved.
  - Implement `/api/webhooks/helius/route.ts`: Listens for the `ApprovalEvent` from the Solana chain and calls the payout route.

### 2. P2 (Next.js Frontend & UI)
- **Hooks (`app/hooks/`)**:
  - Fully implement `useSolDare.ts`, `useDare.ts`, and `useProof.ts` to interface with the Supabase backend and the Anchor client.
- **Components (`app/components/`)**:
  - Build `DareForm.tsx`: Form to create a dare (text, bounty in USDC, expiry, recipient wallet).
  - Build `DareCard.tsx`: Displays dare details, status, and countdown timer.
  - Build `ProofForm.tsx`: Uploads proof (image/video) to Supabase storage.
  - Build `TxStatus.tsx`: Displays transaction loading states, success toasts, and Solana Explorer links.
- **Pages (`app/app/`)**:
  - `page.tsx`: Landing page / Creator dashboard showing a list of dares.
  - `create/page.tsx`: The UI for creating a new dare.
  - `d/[id]/page.tsx`: The public shareable dare link. This page MUST be viewable without a wallet connection (a core feature of x402). 

### 3. P4 (Integration & Handoff)
- **Anchor Client Wiring**: Ensure the frontend button clicks perfectly trigger the Anchor program instructions using the IDL in `app/idl/soldare.json`.
- **E2E Testing**: Act as the ultimate bug finder. Test the flow: Create -> Share -> Accept -> Prove -> Approve -> Payout.
- **Documentation**: Write setup instructions, an architecture diagram, and a qualification checklist in the root `Readme.md`.

---

## Technical Constraints & Guidelines
1. **The IDL is your source of truth**: Use `app/idl/soldare.json` (or the Anchor types in `tests/soldare.ts` for reference) to generate the TypeScript client. Do not alter the Rust program signatures.
2. **x402 UX**: The core magic of this app is that the *recipient* (the person accepting the dare) never needs to hold SOL or pay gas. Ensure the UI flow respects this:
   - Creator pays SOL into the PDA vault.
   - Recipient accepts gaslessly (or minimally).
   - Approval triggers an off-chain x402 route that pays the recipient in USDC.
3. **Styling**: Use Tailwind CSS (`app/tailwind.config.ts`) and ensure a premium, modern aesthetic with glassmorphism or sleek dark mode. 

---

## How to Proceed
1. **READ `progress.md` FIRST** to understand the current blockers.
2. If unblocked, begin by implementing the Supabase API routes so the frontend has a backend to talk to.
3. Move on to the React hooks, build the UI components, and execute P4 integration tests. 
4. **UPDATE `progress.md`** at the end of your session with your accomplishments and your active blockers.
