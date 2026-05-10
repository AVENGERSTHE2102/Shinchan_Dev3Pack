import { NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import idl from '@/idl/soldare.json';

const PROGRAM_ID = new PublicKey(idl.address || "HTiYVYKAGyZptRer8Q3HGZY3ghjm5fo15BVwk7NtWyuA");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { creator_wallet, recipient_wallet, dare_hash, proof_hash } = body ?? {};

    if (!creator_wallet || !recipient_wallet || !dare_hash || !proof_hash) {
      throw new Error("Missing required fields");
    }

    const rpcUrl = process.env.HELIUS_RPC_URL || process.env.NEXT_PUBLIC_HELIUS_RPC_URL || "https://devnet.helius-rpc.com/?api-key=69df4d37-a221-4849-b3a6-9546e2cf3ccb";
    const connection = new Connection(rpcUrl, 'confirmed');
    
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
      PROGRAM_ID
    );

    // Approve Dare Discriminator (sha256("global:approve_dare")[0..8])
    const discriminator = Buffer.from("4bd972d42780febe", "hex");
    const data = Buffer.concat([discriminator, Buffer.from(proofHashArray)]);

    const instruction = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: darePDA, isSigner: false, isWritable: true },
        { pubkey: creator, isSigner: true, isWritable: true },
        { pubkey: recipient, isSigner: false, isWritable: true },
      ],
      data,
    });

    const transaction = new Transaction().add(instruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = creator;

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return NextResponse.json({ 
      transaction: serializedTransaction.toString('base64') 
    });

  } catch (error: any) {
    console.error("❌ APPROVE_TX_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
