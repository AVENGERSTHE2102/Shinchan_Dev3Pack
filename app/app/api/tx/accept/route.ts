import { NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import idl from '@/idl/soldare.json';

const getProgramServer = (connection: Connection) => {
  const provider = new anchor.AnchorProvider(
    connection,
    {} as any,
    { preflightCommitment: 'confirmed' }
  );
  const programId = new PublicKey(idl.address || "HTiYVYKAGyZptRer8Q3HGZY3ghjm5fo15BVwk7NtWyuA");
  return new anchor.Program(idl as any, provider);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Building Accept TX for:", body);

    const { creator_wallet, recipient_wallet, dare_hash } = body ?? {};

    if (!creator_wallet || !recipient_wallet || !dare_hash) {
      throw new Error(`Missing fields. Got creator: ${!!creator_wallet}, recipient: ${!!recipient_wallet}, hash: ${!!dare_hash}`);
    }

    const rpcUrl = process.env.HELIUS_RPC_URL || process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
    if (!rpcUrl) {
      throw new Error("RPC URL missing in server environment. Check app/.env");
    }

    const connection = new Connection(rpcUrl, 'confirmed');
    const program = getProgramServer(connection);
    
    const creator = new PublicKey(creator_wallet);
    const recipient = new PublicKey(recipient_wallet);
    
    // HEALING DARE HASH: Handle multiple input formats (Array, Object, Buffer-like)
    let dareHashArray: number[] = [];
    if (Array.isArray(dare_hash)) {
      dareHashArray = dare_hash;
    } else if (typeof dare_hash === 'object') {
      // Handle { 0: 12, 1: 45 ... } format often returned by Supabase
      dareHashArray = Object.keys(dare_hash)
        .sort((a, b) => Number(a) - Number(b))
        .map(key => (dare_hash as any)[key]);
    }

    if (dareHashArray.length === 0) {
      throw new Error("Could not parse dare_hash into a valid array");
    }

    if (dareHashArray.length !== 32) {
      throw new Error(`Invalid dare_hash length: ${dareHashArray.length}. Expected 32.`);
    }

    const [darePDA] = PublicKey.findProgramAddressSync(
      [
        new TextEncoder().encode("dare"),
        creator.toBytes(),
        new Uint8Array(dareHashArray)
      ],
      program.programId
    );

    console.log("Derived PDA:", darePDA.toBase58());

    const instruction = await program.methods
      .acceptDare()
      .accounts({
        dareAccount: darePDA,
        recipient: recipient,
      })
      .instruction();

    const transaction = new Transaction().add(instruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = recipient;

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return NextResponse.json({ 
      transaction: Buffer.from(serializedTransaction).toString('base64') 
    });

  } catch (error: any) {
    console.error("❌ ACCEPT_TX_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
