# SolDare Context

## The Vision
SolDare is the first social dare platform built on Solana. It reimagines how people collaborate and transact by combining a decentralized trust layer with frictionless payments. 
The core hook: **Dare a friend to do something, attach USDC to it, and if they do it, they get paid instantly.**

## The Problem with "Crypto Escrow"
Traditional crypto escrow apps fail for mainstream users. If you dare a non-crypto friend and use a standard dApp, they have to:
1. Download a wallet (Phantom).
2. Write down a 12-word seed phrase.
3. Figure out what "gas" is.
4. Go to an exchange, buy SOL, and send it to their wallet just to claim a $2 dare.
Result: 0% conversion rate outside of crypto natives.

## The SolDare Solution (Anchor + x402)
SolDare splits the architecture into two layers to achieve a **gasless, seamless UX** for the recipient:
1. **The Trust Layer (Anchor/Rust):** The creator (who has a wallet) locks the bounty (SOL/USDC) into an on-chain PDA vault. The smart contract acts as the neutral arbiter. It enforces expiries and records proof hashes.
2. **The Payment Layer (x402):** The recipient simply clicks a web link. The page is an x402-protected route. They accept the dare and upload proof without connecting a wallet. When the creator approves the proof on-chain, a webhook triggers the x402 payment route, and the Coinbase facilitator sends the USDC directly to the recipient. 

## Hackathon Goal
To deliver a working, end-to-end prototype of this flow within 15 hours. The demo must prove that a non-crypto user can receive a dare and get paid without ever knowing they are using a blockchain.
