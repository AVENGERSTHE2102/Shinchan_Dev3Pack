const { Connection, PublicKey, Transaction, TransactionInstruction } = require('@solana/web3.js');

const rpcUrl = "https://devnet.helius-rpc.com/?api-key=69df4d37-a221-4849-b3a6-9546e2cf3ccb";
const connection = new Connection(rpcUrl, 'confirmed');

const PROGRAM_ID = new PublicKey("HTiYVYKAGyZptRer8Q3HGZY3ghjm5fo15BVwk7NtWyuA");

async function simulate() {
  const creator = new PublicKey('Gz2Y5zACdw2kqwRH7tcGKRj4cxDjg7nbB8jaVhfNZP4F');
  const recipient = new PublicKey('7jcgjL4yDJL8rAfgtPH7fPpusLiR9rbco5SRN2DWd2Ph');
  const dareHashArray = [
    228, 255,  38, 226, 175, 213,  26,  96,
    123, 159,  53,  47,  53, 179,  77, 143,
     35, 140,   9, 225,  97,  69, 106, 107,
     36,  92, 183, 160,  77, 223, 124, 187
  ];

  const [darePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("dare"), creator.toBuffer(), Buffer.from(dareHashArray)],
    PROGRAM_ID
  );
  
  console.log("Dare PDA:", darePDA.toBase58());

  // Check if account exists
  const accountInfo = await connection.getAccountInfo(darePDA);
  if (!accountInfo) {
    console.error("❌ ACCOUNT DOES NOT EXIST ON CHAIN. This is a ghost dare!");
  } else {
    console.log("✅ Account exists, size:", accountInfo.data.length);
  }

  const data = Buffer.from([0xee, 0x7b, 0x48, 0x67, 0x9f, 0xea, 0xd2, 0x53]);

  const instruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: darePDA, isSigner: false, isWritable: true },
      { pubkey: recipient, isSigner: true, isWritable: false },
    ],
    data,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = recipient;
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
