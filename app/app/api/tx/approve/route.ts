import { NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import idl from '@/idl/soldare.json';

const getProgramServer = (connection: Connection) => {
  const provider = new anchor.AnchorProvider(connection, {} as any, { preflightCommitment: 'confirmed' });
  const programId = new PublicKey(idl.address || "HTiYVYKAGyZptRer8Q3HGZY3ghjm5fo15BVwk7NtWyuA");
  return new anchor.Program(idl as any, provider);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { creator_wallet, recipient_wallet, dare_hash, proof_hash } = body ?? {};

    const rpcUrl = process.env.HELIUS_RPC_URL || process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
    const connection = new Connection(rpcUrl!, 'confirmed');
    const program = getProgramServer(connection);
    
    const creator = new PublicKey(creator_wallet);
    const recipient = new PublicKey(recipient_wallet);
    
    // Healing dare_hash
    let dareHashArray: number[] = [];
    if (Array.isArray(dare_hash)) dareHashArray = dare_hash;
    else if (typeof dare_hash === 'object') {
      dareHashArray = Object.keys(dare_hash).sort((a,b) => Number(a)-Number(b)).map(k => (dare_hash as any)[k]);
    }

    // Healing proof_hash
    let proofHashArray: number[] = [];
    if (Array.isArray(proof_hash)) proofHashArray = proof_hash;
    else if (typeof proof_hash === 'object') {
      proofHashArray = Object.keys(proof_hash).sort((a,b) => Number(a)-Number(b)).map(k => (proof_hash as any)[k]);
    }

    const [darePDA] = PublicKey.findProgramAddressSync(
      [
        new TextEncoder().encode("dare"),
        creator.toBytes(),
        new Uint8Array(dareHashArray)
      ],
      program.programId
    );

    const instruction = await program.methods
      .approveDare(proofHashArray)
      .accounts({
        dareAccount: darePDA,
        creator: creator,
        recipient: recipient,
      })
      .instruction();

    const transaction = new Transaction().add(instruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = creator;

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return NextResponse.json({ 
      transaction: Buffer.from(serializedTransaction).toString('base64') 
    });

  } catch (error: any) {
    console.error("❌ APPROVE_TX_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
