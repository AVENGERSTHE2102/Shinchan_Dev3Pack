use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("HTiYVYKAGyZptRer8Q3HGZY3ghjm5fo15BVwk7NtWyuA"); // Placeholder, update after deployment

#[program]
pub mod soldare {
    use super::*;

    // ── Instruction: create_dare ─────────────────────────────────────────────────
    // Called by: creator (must be a Signer)
    // Effect:    locks `bounty_lamports` SOL into the DareAccount PDA vault
    //            and records dare parameters. After this, bounty is unreachable
    //            until approve_dare or reclaim.
    // PDA seeds: ["dare", creator_pubkey, dare_hash]
    // Emits:     DareCreated event (caught by Helius for real-time UI updates)
    pub fn create_dare(
        ctx: Context<CreateDare>,
        dare_hash: [u8; 32],
        bounty_lamports: u64,
        expires_in_seconds: i64,
        dare_id: String,
    ) -> Result<()> {
        // --- Input validation ---
        require!(bounty_lamports >= 1_000_000, SolDareError::BountyTooSmall); // min 0.001 SOL — prevents dust spam

        require!(
            expires_in_seconds > 0 && expires_in_seconds <= 604_800,
            SolDareError::InvalidExpiry
        ); // 1 second → 7 days

        require!(dare_id.len() <= 36, SolDareError::DareIdTooLong); // UUID is exactly 36 chars

        // --- Populate account fields ---
        let clock = Clock::get()?;

        ctx.accounts.dare_account.creator = ctx.accounts.creator.key();
        ctx.accounts.dare_account.recipient = Pubkey::default(); // zero address until accept_dare
        ctx.accounts.dare_account.bounty = bounty_lamports;
        ctx.accounts.dare_account.dare_hash = dare_hash;
        ctx.accounts.dare_account.proof_hash = [0u8; 32]; // empty until approve_dare
        ctx.accounts.dare_account.expires_at = clock.unix_timestamp + expires_in_seconds;
        ctx.accounts.dare_account.status = DareStatus::Open;
        ctx.accounts.dare_account.dare_id = dare_id.clone();
        ctx.accounts.dare_account.bump = ctx.bumps.dare_account;

        // --- CPI: transfer SOL from creator into PDA ---
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.creator.to_account_info(),
                to: ctx.accounts.dare_account.to_account_info(),
            },
        );
        system_program::transfer(cpi_ctx, bounty_lamports)?;

        // --- Emit event for Helius webhook ---
        emit!(DareCreated {
            dare_id: dare_id,
            creator: ctx.accounts.dare_account.creator,
            bounty: bounty_lamports,
            expires_at: ctx.accounts.dare_account.expires_at,
        });

        Ok(())
    }

    // ── Instruction: accept_dare ─────────────────────────────────────────────────
    // Called by: recipient (must be a Signer)
    // Effect:    marks the dare as Accepted and records the recipient's pubkey.
    // PDA seeds: ["dare", creator_pubkey, dare_hash]
    // Emits:     DareAccepted event
    pub fn accept_dare(ctx: Context<AcceptDare>) -> Result<()> {
        let dare = &mut ctx.accounts.dare_account;
        let clock = Clock::get()?;

        require!(dare.status == DareStatus::Open, SolDareError::InvalidStatus);
        require!(
            clock.unix_timestamp < dare.expires_at,
            SolDareError::DareExpired
        );

        dare.status = DareStatus::Accepted;
        dare.recipient = ctx.accounts.recipient.key();

        emit!(DareAccepted {
            dare_id: dare.dare_id.clone(),
            recipient: dare.recipient,
        });

        Ok(())
    }

    // ── Instruction: approve_dare ─────────────────────────────────────────────────
    // Called by: creator (must be a Signer)
    // Effect:    marks the dare as Approved, records the proof hash,
    //            emits ApprovalEvent (triggers x402 payout), and returns
    //            the SOL bounty collateral to the creator.
    // PDA seeds: ["dare", creator_pubkey, dare_hash]
    // Emits:     ApprovalEvent (caught by Helius to fire x402 payout)
    pub fn approve_dare(ctx: Context<ApproveDare>, proof_hash: [u8; 32]) -> Result<()> {
        let dare = &mut ctx.accounts.dare_account;
        let clock = Clock::get()?;

        require!(
            dare.status == DareStatus::Open || dare.status == DareStatus::Accepted,
            SolDareError::InvalidStatus
        );
        require!(
            clock.unix_timestamp < dare.expires_at,
            SolDareError::DareExpired
        );

        dare.status = DareStatus::Approved;
        dare.proof_hash = proof_hash;

        // Emit the event Helius catches to sync status
        emit!(ApprovalEvent {
            dare_id: dare.dare_id.clone(),
            recipient: ctx.accounts.recipient.key(),
            bounty_lamports: dare.bounty,
            proof_hash,
        });

        // Transfer the locked SOL bounty to the recipient.
        // This is the actual on-chain payout — no treasury needed.
        let bounty = dare.bounty;
        **dare.to_account_info().try_borrow_mut_lamports()? -= bounty;
        **ctx.accounts.recipient.to_account_info().try_borrow_mut_lamports()? += bounty;

        Ok(())
    }

    // ── Instruction: reclaim ─────────────────────────────────────────────────────
    // Called by: creator (must be a Signer)
    // Effect:    reclaims the SOL bounty and rent-exempt minimum after expiry.
    //            Closes the DareAccount PDA.
    // PDA seeds: ["dare", creator_pubkey, dare_hash]
    // Emits:     DareExpired event
    pub fn reclaim(ctx: Context<Reclaim>) -> Result<()> {
        let dare = &mut ctx.accounts.dare_account;
        let clock = Clock::get()?;

        require!(
            dare.status != DareStatus::Approved,
            SolDareError::AlreadyApproved
        );
        require!(
            clock.unix_timestamp >= dare.expires_at,
            SolDareError::NotYetExpired
        );

        dare.status = DareStatus::Expired;

        // Return the locked bounty
        let bounty = dare.bounty;
        **dare.to_account_info().try_borrow_mut_lamports()? -= bounty;
        **ctx
            .accounts
            .creator
            .to_account_info()
            .try_borrow_mut_lamports()? += bounty;

        emit!(DareExpired {
            dare_id: dare.dare_id.clone(),
            bounty_returned: bounty,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(dare_hash: [u8; 32], bounty_lamports: u64, expires_in_seconds: i64, dare_id: String)]
pub struct CreateDare<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + DareAccount::INIT_SPACE,
        seeds = [b"dare", creator.key().as_ref(), dare_hash.as_ref()],
        bump
    )]
    pub dare_account: Account<'info, DareAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptDare<'info> {
    #[account(
        mut,
        seeds = [b"dare", dare_account.creator.as_ref(), dare_account.dare_hash.as_ref()],
        bump = dare_account.bump
    )]
    pub dare_account: Account<'info, DareAccount>,

    pub recipient: Signer<'info>,
}

#[derive(Accounts)]
pub struct ApproveDare<'info> {
    #[account(
        mut,
        seeds = [b"dare", dare_account.creator.as_ref(), dare_account.dare_hash.as_ref()],
        bump = dare_account.bump,
        has_one = creator @ SolDareError::Unauthorized,
    )]
    pub dare_account: Account<'info, DareAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,

    /// CHECK: recipient's wallet — no on-chain validation needed,
    /// we trust the frontend to pass the correct pubkey.
    /// x402 sends the actual USDC; this account receives the SOL return.
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Reclaim<'info> {
    #[account(
        mut,
        seeds = [b"dare", dare_account.creator.as_ref(), dare_account.dare_hash.as_ref()],
        bump = dare_account.bump,
        has_one = creator @ SolDareError::Unauthorized,
        close = creator  // ← returns rent-exempt minimum to creator on close
    )]
    pub dare_account: Account<'info, DareAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct DareAccount {
    pub creator: Pubkey,      // 32 bytes
    pub recipient: Pubkey,    // 32 bytes — Pubkey::default() until accepted
    pub bounty: u64,          // 8  bytes — lamports locked in this PDA
    pub dare_hash: [u8; 32],  // 32 bytes — SHA-256 of dare text
    pub proof_hash: [u8; 32], // 32 bytes — SHA-256 of proof, set on approve
    pub expires_at: i64,      // 8  bytes — unix timestamp
    pub status: DareStatus,   // 1  byte  — enum
    pub bump: u8,             // 1  byte  — stored to avoid re-derivation
    #[max_len(36)]
    pub dare_id: String, // 4 + 36 = 40 bytes — Supabase UUID
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum DareStatus {
    Open,     // created, not yet accepted
    Accepted, // recipient signed accept_dare
    Approved, // creator approved proof, x402 payout fired
    Expired,  // past expires_at without approval
}

#[event]
pub struct DareCreated {
    pub dare_id: String,
    pub creator: Pubkey,
    pub bounty: u64,
    pub expires_at: i64,
}

#[event]
pub struct DareAccepted {
    pub dare_id: String,
    pub recipient: Pubkey,
}

#[event]
pub struct ApprovalEvent {
    pub dare_id: String,        // Helius uses this to sync Supabase
    pub recipient: Pubkey,      // recipient of the SOL
    pub bounty_lamports: u64,   // payment amount in lamports
    pub proof_hash: [u8; 32],   // audit trail
}

#[event]
pub struct DareExpired {
    pub dare_id: String,
    pub bounty_returned: u64,
}

#[error_code]
pub enum SolDareError {
    #[msg("Bounty must be at least 0.001 SOL (1,000,000 lamports)")]
    BountyTooSmall,

    #[msg("Expiry must be between 1 second and 7 days")]
    InvalidExpiry,

    #[msg("Dare ID must be 36 characters or fewer (UUID format)")]
    DareIdTooLong,

    #[msg("Dare is not in the correct status for this instruction")]
    InvalidStatus,

    #[msg("Dare has expired — the deadline has passed")]
    DareExpired,

    #[msg("Dare has not yet expired — cannot reclaim before deadline")]
    NotYetExpired,

    #[msg("Only the dare creator can call this instruction")]
    Unauthorized,

    #[msg("Dare has already been approved and paid out")]
    AlreadyApproved,
}
