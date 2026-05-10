# ⚡ SolDare Documentation Hub

Welcome to the SolDare repository.

SolDare is a decentralized social challenge platform built on Solana where users can create dares, lock crypto rewards, submit proof, and receive automated payouts through smart contracts and x402 infrastructure.

This documentation system is designed to support both:

* human developers
* AI coding agents

Each document has a specific responsibility to reduce overlap, prevent conflicts, and streamline handoffs during rapid development.

---

# 📚 Documentation Index

## 🚦 Workflow & Handoffs

### `progress.md`

**READ THIS FIRST**

The live baton-pass document.

Tracks:

* recently completed work
* current blockers
* immediate next steps
* pending integrations
* deployment status

Every contributor or agent must append updates before ending their session.

---

### `instructions.md`

The master implementation checklist for:

* P2 Frontend
* P3 Backend/x402

Contains:

* file-by-file implementation tasks
* architectural constraints
* frozen directories that must not be modified
* integration sequencing

---

# 🧠 Project Context

### `context.md`

Explains:

* the product vision
* the problem SolDare solves
* why traditional escrow UX fails
* how Solana + x402 enable gasless reward experiences

Read this to understand the "why" behind the architecture.

---

### `project.md`

Technical blueprint of the project.

Includes:

* tech stack
* project structure
* smart contract workflow
* API architecture
* Supabase integration
* environment variables
* deployment assumptions

---

# 👥 Team Roles

### `agents.md`

Defines the 4 core implementation domains:

| Role | Responsibility                  |
| ---- | ------------------------------- |
| P1   | Rust / Anchor smart contracts   |
| P2   | Next.js frontend                |
| P3   | Backend APIs + x402             |
| P4   | Devnet deployment + integration |

This file prevents overlap and accidental modification of protected domains.

---

# 🐛 Testing & QA

### `feedback.md`

Centralized E2E testing and bug tracking document.

Used for:

* deployment verification
* integration testing
* wallet flow testing
* Supabase debugging
* Vercel deployment checks
* hackathon demo readiness

---

# 🔒 Current Project Status

## ✅ P1 — Rust / Anchor

Smart contracts are fully complete.

Implemented:

* `create_dare`
* `accept_dare`
* `approve_dare`
* `reclaim`

Anchor program logic is now frozen unless critical bugs appear.

---

## ⏳ Current Blocker

P4 deployment is pending.

The frontend and backend are currently waiting for:

* Devnet deployment
* deployed Program ID
* finalized Anchor IDL export

Once deployed:

* real wallet interactions
* live transactions
* proof approval flows
* automated payouts

can be fully connected.

---

# 🚀 Vercel Deployment Requirements

## Required Configuration

### Root Directory

Set Vercel root directory to:

```text id="6jlwm8"
app
```

---

### Node Version

Use:

```text id="hjlwmd"
20.x
```

---

# 🔑 Required Environment Variables

```env id="rjlwmy"
NEXT_PUBLIC_SOLANA_NETWORK=
NEXT_PUBLIC_PROGRAM_ID=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

HELIUS_API_KEY=
HELIUS_RPC_URL=
HELIUS_WEBHOOK_SECRET=

TREASURY_SECRET_KEY=
USDC_MINT=

COINBASE_API_KEY=

RESEND_API_KEY=
EMAIL_FROM=

NEXT_PUBLIC_APP_URL=
```

---

# 🛠️ Deployment Notes

Already implemented in-repo:

* API routes pinned to `nodejs` runtime for Vercel compatibility
* Node version pinned to `20.x`
* `.env.example` templates included
* environment validation with fail-fast behavior
* optional email notification support through Resend

Email features activate only when:

* `RESEND_API_KEY`
* `EMAIL_FROM`

are configured.

---

# ⚡ SolDare

### Dare Anything. Earn On-Chain.

Built with:

* Solana
* Anchor
* Next.js
* Supabase
* x402

And an unreasonable tolerance for JavaScript tooling errors.
