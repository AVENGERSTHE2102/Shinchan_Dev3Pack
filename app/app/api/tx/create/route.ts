import { NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import idl from '@/idl/soldare.json';

const getProgramServer = (connection: Connection) => {
  const provider = new anchor.AnchorProvider(connection, {} as any, { preflightCommitment: 'confirmed' });
  const programId = new PublicKey(idl.address || "HTiYVYKAGyZptRer8Q3HGZY3ghjm5fo15BVwk7NtWyuA");
  return new anchor.Program(idl as any, provider) as any;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { creator_wallet, dare_id, bounty_lamports, dare_hash, expires_in_seconds } = body ?? {};

    const rpcUrl = process.env.HELIUS_RPC_URL || 
                   process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 
                   "https://devnet.helius-rpc.com/?api-key=69df4d37-a221-4849-b3a6-9546e2cf3ccb";

    const connection = new Connection(rpcUrl, 'confirmed');
    const program = getProgramServer(connection);
    
    const creator = new PublicKey(creator_wallet);
    
    let dareHashArray: number[] = [];
    if (Array.isArray(dare_hash)) dareHashArray = dare_hash;
    else if (typeof dare_hash === 'object') {
      dareHashArray = Object.keys(dare_hash).sort((a,b) => Number(a)-Number(b)).map(k => (dare_hash as any)[k]);
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
      .createDare(
        dareHashArray,
        new anchor.BN(bounty_lamports),
        new anchor.BN(expires_in_seconds || 86400),
        dare_id
      )
      .accounts({
        dareAccount: darePDA,
        creator: creator,
        systemProgram: SystemProgram.programId,
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
    console.error("❌ CREATE_TX_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
