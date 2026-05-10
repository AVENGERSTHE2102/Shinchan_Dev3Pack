const { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram } = require('@solana/web3.js');

const rpcUrl = "https://devnet.helius-rpc.com/?api-key=69df4d37-a221-4849-b3a6-9546e2cf3ccb";
const connection = new Connection(rpcUrl, 'confirmed');

const PROGRAM_ID = new PublicKey("HTiYVYKAGyZptRer8Q3HGZY3ghjm5fo15BVwk7NtWyuA");

async function simulate() {
  const creator = new PublicKey('Gz2Y5zACdw2kqwRH7tcGKRj4cxDjg7nbB8jaVhfNZP4F');
  const dareHashArray = new Array(32).fill(1); // dummy dare_hash
  const dareId = "e5ab6b64-0000-0000-0000-000000000000";
  const bountyLamports = 10000000; // 0.01 SOL
  const expiresInSeconds = 86400;

  const [darePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("dare"), creator.toBuffer(), Buffer.from(dareHashArray)],
    PROGRAM_ID
  );
  
  console.log("Dare PDA:", darePDA.toBase58());

  const dareIdBytes = Buffer.from(dareId, "utf-8");
  const data = Buffer.alloc(8 + 32 + 8 + 8 + 4 + dareIdBytes.length);
  let offset = 0;

  // discriminator: a5f8071b63bb19c6
  Buffer.from([0xa5, 0xf8, 0x07, 0x1b, 0x63, 0xbb, 0x19, 0xc6]).copy(data, offset); offset += 8;
  Buffer.from(dareHashArray).copy(data, offset); offset += 32;
  data.writeBigUInt64LE(BigInt(bountyLamports), offset); offset += 8;
  data.writeBigInt64LE(BigInt(expiresInSeconds), offset); offset += 8;
  data.writeUInt32LE(dareIdBytes.length, offset); offset += 4;
  dareIdBytes.copy(data, offset);

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
  transaction.feePayer = creator;
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  try {
    const res = await connection.simulateTransaction(transaction);
    console.log("Simulation Result:", res.value);
  } catch (e) {
    console.error("Simulation failed natively:", e);
  }
}

simulate();
