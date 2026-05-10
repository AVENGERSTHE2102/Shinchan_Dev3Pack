import { NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import idl from '@/idl/soldare.json';

const PROGRAM_ID = new PublicKey(idl.address || "HTiYVYKAGyZptRer8Q3HGZY3ghjm5fo15BVwk7NtWyuA");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { creator_wallet, dare_id, bounty_lamports, dare_hash, expires_in_seconds } = body ?? {};

    if (!creator_wallet || !dare_id || bounty_lamports === undefined || !dare_hash) {
      throw new Error("Missing required fields");
    }

    const rpcUrl = process.env.HELIUS_RPC_URL || process.env.NEXT_PUBLIC_HELIUS_RPC_URL || "https://devnet.helius-rpc.com/?api-key=69df4d37-a221-4849-b3a6-9546e2cf3ccb";
    const connection = new Connection(rpcUrl, 'confirmed');
    
    const creator = new PublicKey(creator_wallet);
    
    // Healing dare_hash
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
      PROGRAM_ID
    );

    // Create Dare Discriminator (sha256("global:create_dare")[0..8])
    const dareIdBuffer = Buffer.from(dare_id, "utf-8");
    const data = Buffer.alloc(8 + 32 + 8 + 8 + 4 + dareIdBuffer.length);
    let offset = 0;

    // discriminator
    Buffer.from("a5f8071b63bb19c6", "hex").copy(data, offset);
    offset += 8;

    // dare_hash
    Buffer.from(dareHashArray).copy(data, offset);
    offset += 32;

    // bounty_lamports
    data.writeBigUInt64LE(BigInt(bounty_lamports), offset);
    offset += 8;

    // expires_in_seconds
    data.writeBigInt64LE(BigInt(expires_in_seconds || 86400), offset);
    offset += 8;

    // dare_id string length
    data.writeUInt32LE(dareIdBuffer.length, offset);
    offset += 4;

    // dare_id string content
    dareIdBuffer.copy(data, offset);

    const instruction = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: darePDA, isSigner: false, isWritable: true },
        { pubkey: creator, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
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
    console.error("❌ CREATE_TX_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
