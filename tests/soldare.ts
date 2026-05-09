import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Soldare } from "../target/types/soldare";
import { expect } from "chai";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as crypto from "crypto";

describe("soldare", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Soldare as Program<Soldare>;
  const creator = provider.wallet;

  const getDarePDA = (creatorPubkey: PublicKey, dareHash: Buffer) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("dare"), creatorPubkey.toBuffer(), dareHash],
      program.programId
    );
  };

  it("Creates a dare successfully", async () => {
    const dareText = "Eat a whole lemon in 30 seconds";
    const dareHash = crypto.createHash("sha256").update(dareText).digest();
    const bounty = 0.1 * LAMPORTS_PER_SOL;
    const expiresAt = 3600; // 1 hour
    const dareId = "test-uuid-1234-5678-9012";

    const [darePDA, bump] = getDarePDA(creator.publicKey, dareHash);

    await program.methods
      .createDare(Array.from(dareHash), new anchor.BN(bounty), new anchor.BN(expiresAt), dareId)
      .accounts({
        dareAccount: darePDA,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const dareAccount = await program.account.dareAccount.fetch(darePDA);

    expect(dareAccount.creator.toString()).to.equal(creator.publicKey.toString());
    expect(dareAccount.bounty.toNumber()).to.equal(bounty);
    expect(dareAccount.dareId).to.equal(dareId);
    expect(dareAccount.status).to.deep.equal({ open: {} });
    expect(dareAccount.bump).to.equal(bump);

    // Check balance of PDA
    const pdaBalance = await provider.connection.getBalance(darePDA);
    expect(pdaBalance).to.be.at.least(bounty);
  });

  it("Accepts a dare", async () => {
    const dareText = "Acceptance Test Dare";
    const dareHash = crypto.createHash("sha256").update(dareText).digest();
    const bounty = 0.01 * LAMPORTS_PER_SOL;
    const [darePDA] = getDarePDA(creator.publicKey, dareHash);
    const recipient = anchor.web3.Keypair.generate();

    // Create the dare first
    await program.methods
      .createDare(Array.from(dareHash), new anchor.BN(bounty), new anchor.BN(3600), "acc-id")
      .accounts({
        dareAccount: darePDA,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Accept the dare
    await program.methods
      .acceptDare()
      .accounts({
        dareAccount: darePDA,
        recipient: recipient.publicKey,
      })
      .signers([recipient])
      .rpc();

    const dareAccount = await program.account.dareAccount.fetch(darePDA);
    expect(dareAccount.status).to.deep.equal({ accepted: {} });
    expect(dareAccount.recipient.toString()).to.equal(recipient.publicKey.toString());
  });

  it("Approves a dare and closes account", async () => {
    const dareText = "Approval Test Dare";
    const dareHash = crypto.createHash("sha256").update(dareText).digest();
    const bounty = 0.05 * LAMPORTS_PER_SOL;
    const [darePDA] = getDarePDA(creator.publicKey, dareHash);
    const recipient = anchor.web3.Keypair.generate();
    const proofHash = crypto.createHash("sha256").update("proof-url").digest();

    // Create the dare
    await program.methods
      .createDare(Array.from(dareHash), new anchor.BN(bounty), new anchor.BN(3600), "app-id")
      .accounts({
        dareAccount: darePDA,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Approve the dare
    const creatorBalanceBefore = await provider.connection.getBalance(creator.publicKey);
    
    await program.methods
      .approveDare(Array.from(proofHash))
      .accounts({
        dareAccount: darePDA,
        creator: creator.publicKey,
        recipient: recipient.publicKey,
      })
      .rpc();

    // Account should NOT be closed, status should be Approved
    const dareAccount = await program.account.dareAccount.fetch(darePDA);
    expect(dareAccount.status).to.deep.equal({ approved: {} });
    expect(dareAccount.proofHash).to.deep.equal(Array.from(proofHash));

    // Balance should be returned to creator (minus rent for keeping PDA open)
    const creatorBalanceAfter = await provider.connection.getBalance(creator.publicKey);
    expect(creatorBalanceAfter).to.be.greaterThan(creatorBalanceBefore);
  });

  it("Fails to reclaim before expiry", async () => {
    const dareText = "Reclaim Failure Test";
    const dareHash = crypto.createHash("sha256").update(dareText).digest();
    const bounty = 0.01 * LAMPORTS_PER_SOL;
    const [darePDA] = getDarePDA(creator.publicKey, dareHash);

    await program.methods
      .createDare(Array.from(dareHash), new anchor.BN(bounty), new anchor.BN(3600), "rec-fail-id")
      .accounts({
        dareAccount: darePDA,
        creator: creator.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    try {
      await program.methods
        .reclaim()
        .accounts({
          dareAccount: darePDA,
          creator: creator.publicKey,
        })
        .rpc();
      expect.fail("Should have failed with NotYetExpired");
    } catch (err: any) {
      expect(err.message).to.contain("NotYetExpired");
    }
  });
});
