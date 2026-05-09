# SolDare Progress & Blocker Report

## 🟢 Completed by P1 (Rust Dev)
P1 has successfully completed the core Rust/Anchor implementation ahead of schedule:
- **Phase 1 (Core Build)**: 
  - Defined `DareAccount` PDA struct and `DareStatus` enum.
  - Implemented all 4 core instructions (`create_dare`, `accept_dare`, `approve_dare`, `reclaim`).
  - Implemented exact `InitSpace` (194 bytes) and CPI logic for lamport transfers.
- **Phase 3 (Code Quality)**: 
  - Executed the "H10 Code Quality Pass". 
  - Added judge-facing comments explaining PDA derivations, `has_one` constraints, and the `Clock` sysvar for auditability.
  - Fixed a critical audit-trail bug in `approve_dare` by removing the `close = creator` constraint to preserve proof hashes on-chain.
- **Testing**: 
  - Wrote the complete Anchor integration test suite in `tests/soldare.ts`.

---

## 🛑 Current Blockers: Who is blocking P1?
**P1 is currently BLOCKED by P4 (Integration/Demo Lead)**. 

Because P1 has finished writing the local Rust code, the project cannot proceed until the Anchor program is physically compiled, deployed to the Solana devnet, and its interface (IDL) is exported for the frontend team (P2/P3). 

---

## 🛠️ Action Items to Unblock P1
**P4 (or the User acting as P4) MUST complete the following tasks:**

1. **Deploy to Devnet (H5 Milestone)**:
   - Open [Solana Playground](https://beta.solpg.io/).
   - Create a new Anchor project and paste the contents of `programs/soldare/src/lib.rs`.
   - Run `Build` and then `Deploy`.
   - *Requirement*: You must have a devnet wallet connected with at least 2 devnet SOL to pay for the program deployment.

2. **Retrieve the Program ID**:
   - Once deployed, copy the generated **Program ID** from Solana Playground.
   - Replace the placeholder `declare_id!("11111111111111111111111111111111");` in `lib.rs` with the real Program ID.
   - Update all `.env` files with this new Program ID.

3. **Export the IDL**:
   - In Solana Playground, go to the IDL tab and export/copy the JSON file.
   - Paste this JSON into `/app/idl/soldare.json`. This is the critical handoff from P1 to the frontend teams (P2/P3).

---

## ⏭️ P1's Next Steps (Once Unblocked)
As soon as P4 completes the deployment and IDL export, P1 will resume work on:
1. **Phase 4 (Submission Prep)**: Writing the "Program Architecture" and "Security Notes" sections for the final `README.md`.
2. **Phase 3/4 (E2E Integration)**: Standing by to fix any Rust logic bugs discovered when P2 (Frontend) and P3 (x402 Backend) run the first end-to-end devnet transaction.

---

## 🔵 Update by P3/P4 Agent (2026-05-09)
### What I accomplished
- Pulled latest `origin/main` and rebased local P3 work onto the new repository state.
- Implemented backend API routes in Next.js App Router:
  - `app/app/api/dare/create/route.ts`
  - `app/app/api/dare/approve/route.ts`
  - `app/app/api/dare/payout/route.ts`
  - `app/app/api/webhooks/helius/route.ts`
- Implemented shared payout logic in `app/lib/payout.ts`:
  - devnet USDC SPL transfer
  - recipient ATA auto-create
  - idempotency guard via `payout_tx`
  - low treasury warning when balance is below $5 USDC
- Updated `app/lib/supabase.ts` to include service-role admin client for secure server routes.
- Aligned `supabase/schema.sql` to P3 route contract (`creator_wallet`, `bounty_usdc_cents`, payout tracking columns, paid state).
- Expanded middleware matcher to include all dare API routes + Helius webhook endpoint.

### Next steps
1. Wire real `@x402/next` middleware logic (currently placeholder passthrough).
2. Align webhook parser with actual Anchor event/log format from deployed program.
3. Run endpoint-level tests (`create`, `approve`, `payout`, webhook) against real Supabase + devnet treasury.
4. Integrate frontend hooks/UI calls to these APIs and verify end-to-end flow.

### Current blockers
- **Blocked by User/P4 deployment inputs**:
  - Need final deployed Program ID and confirmed event/log format used in `approve_dare`.
  - Need valid envs in `app/.env.local` (`SUPABASE_SERVICE_ROLE_KEY`, `HELIUS_RPC_URL`, `TREASURY_SECRET_KEY`, `USDC_MINT`, `HELIUS_WEBHOOK_SECRET`).
- **Blocked by dependency setup**:
  - `@solana/spl-token` must be available in `app/package.json` dependencies for payout module runtime.

## 🔵 Update by P3 Agent (2026-05-09, pass 2)
### What I accomplished
- Hardened payout safety in `app/lib/payout.ts`:
  - `payoutDare` now prefers Supabase row data (`recipient_wallet`, `bounty_usdc_cents`) and only uses request values as optional overrides.
  - Added payout eligibility check (`approved` / `proof_submitted` only).
  - Kept idempotency guard via existing `payout_tx`.
- Upgraded API contracts:
  - `POST /api/dare/create` now accepts optional `recipient_wallet` and stores it.
  - `POST /api/dare/payout` now requires only `dare_id`; recipient/bounty can be resolved from DB.
  - `POST /api/dare/approve` now persists `recipient_wallet` when marking dare as approved.
- Hardened Helius webhook parser in `app/app/api/webhooks/helius/route.ts`:
  - Supports expected marker format (`SOLDRARE_APPROVAL::...`).
  - Added fallback parsing for direct fields and description UUID extraction.
- Updated `app/lib/x402.ts` helper methods to match route payload contracts and fallback flow.

### Next steps
1. Install missing runtime dependency `@solana/spl-token` in `app/package.json` and lockfile.
2. Validate real Helius payload against deployed devnet program and finalize parser to exact shape.
3. Run route-level tests locally and in Vercel preview for create/approve/payout/webhook.

### Current blockers
- Blocked by environment/runtime setup: need valid `app/.env.local` with treasury + Supabase service role + Helius vars.
- Blocked by dependency setup until `@solana/spl-token` is installed.

## 🔵 Update by P3 Agent (2026-05-09, pass 3)
### What I accomplished
- Normalized `.env.local` placement and format for Next.js (`app/.env.local`).
- Installed workspace dependencies and added `@solana/spl-token` support for payout logic.
- Continued P3 implementation hardening and attempted build verification.

### Blocker discovered
- Local build/runtime is blocked by Node version mismatch:
  - Current environment: `node v25.8.0`
  - Project stack: Next.js 14 + React 18 expects LTS Node (18/20/22).
  - Failure reproduces consistently in `next build` before route-level validation can proceed.

### Next steps once unblocked
1. Switch local/runtime to Node 20 LTS (recommended) for this repo.
2. Reinstall deps cleanly and rerun build.
3. Continue API route verification (`create`, `approve`, `payout`, `helius webhook`) and E2E payout checks.


# P3 Quick Progress (Simple Handoff)

Date: 2026-05-09
Owner: P3 (Backend + x402)

## 1. What is DONE by P3

1. API routes are implemented:
- `app/app/api/dare/create/route.ts`
- `app/app/api/dare/approve/route.ts`
- `app/app/api/dare/payout/route.ts`
- `app/app/api/webhooks/helius/route.ts`

2. Backend helper logic is implemented:
- `app/lib/payout.ts` (USDC transfer, ATA create, idempotency)
- `app/lib/supabase.ts` (admin client)
- `app/lib/x402.ts` (frontend helper calls)

3. Database schema aligned for payout flow:
- `supabase/schema.sql`

4. Project compatibility fixes completed:
- Build works now (`npm run build --workspace=app` passes)
- `next.config.ts` converted to `next.config.mjs`
- TypeScript target fixed for BigInt

---

## 2. What is STILL STUCK (Blockers)

## Blocker A: Real env values missing for live payout flow
Status: BLOCKED
Need these set correctly in `app/.env.local`:
- `HELIUS_RPC_URL`
- `HELIUS_WEBHOOK_SECRET`
- `USDC_MINT`
- `TREASURY_SECRET_KEY`

Owner: User / P4

Why it blocks P3:
- Payout route cannot send USDC without treasury + RPC + mint values.

---

## Blocker B: Final deployed contract details not confirmed
Status: PARTIALLY BLOCKED
Need:
- Final devnet `PROGRAM_ID`
- Confirm actual ApprovalEvent/log format from deployed contract

Owner: P1 + P4

Why it blocks P3:
- Webhook route works, but final parser must match real chain payload 100%.

---

## Blocker C: End-to-end integration not run yet
Status: PENDING
Need full test flow:
- Create -> Approve -> Payout -> Webhook

Owner: P4 (with P2 + P3 support)

Why it blocks P3 completion:
- Backend code is ready, but not fully proven in live devnet E2E.

---

## 3. Pending by Role (Simple)

## P1
1. Confirm final event/log shape for `ApprovalEvent`.
2. Share final Program ID used in deployment.

## P2
1. Ensure frontend calls:
- `/api/dare/create`
- `/api/dare/approve` after approve tx confirms
2. Pass correct `dare_id`, `recipient`, `bounty_usdc_cents`.

## P3
1. Final webhook parser tune (after real payload sample).
2. Run and fix live payout/API issues once env is complete.

## P4
1. Fill all env vars in local + Vercel.
2. Configure Helius webhook endpoint.
3. Run full E2E and report failures in `feedback.md`.

## User (Infra owner)
1. Rotate leaked secrets (service role key / DB password if exposed).
2. Confirm devnet treasury funded with SOL + USDC.

---

## 4. Exact Next Steps (Do in order)

1. P4/User: complete env vars in `app/.env.local`.
2. P1/P4: give final Program ID + real ApprovalEvent payload sample.
3. P2: connect approve UI to `/api/dare/approve`.
4. P3: run live API tests and fix any payout/webhook issues.
5. P4: run full demo flow and mark checklist in `feedback.md`.

---

## 5. Current P3 Status
- Code: READY
- Live execution: WAITING on env + deployment details + E2E run
