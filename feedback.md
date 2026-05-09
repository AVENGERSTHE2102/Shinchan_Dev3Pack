# SolDare Feedback & Testing Log

Use this document to log issues, bugs, and feedback during the integration and testing phases (especially Phase 3/4).

## E2E Testing Checklist (P4 to fill out)
- [ ] Dare creation inserts into Supabase correctly.
- [ ] Dare creation triggers Anchor `create_dare` successfully.
- [ ] Shareable link generates and loads data without a wallet.
- [ ] Recipient can accept the dare (triggering Anchor `accept_dare`).
- [ ] Proof upload successfully saves to Supabase storage.
- [ ] Creator can approve the dare (triggering Anchor `approve_dare`).
- [ ] Helius webhook catches the `ApprovalEvent`.
- [ ] Webhook triggers `/api/dare/payout`.
- [ ] x402 middleware successfully transfers USDC to recipient.

## Active Bugs / Feedback
*(Append new bugs here during E2E testing. Format: `[Date] [Reporter] [Component]: Description - [Status]`)*

1. `[Example] [P4] [x402 Payout]: Helius webhook is timing out before x402 transfer completes. - [OPEN]`
2. `[Example] [P2] [UI]: Countdown timer shows NaN when expiry is missing. - [RESOLVED]`

## Judging Criteria Reminders
Keep these in mind when providing feedback on the UI or code:
- **Creativity**: Is this a unique use of x402? (Yes, consumer social).
- **UX**: Does it actually feel gasless for the recipient?
- **Code Quality**: Are the Anchor programs well-commented and secure?
- **Completeness**: Does the demo work from end-to-end without failing?
