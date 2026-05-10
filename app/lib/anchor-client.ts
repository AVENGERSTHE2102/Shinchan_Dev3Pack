import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import idl from '../idl/soldare.json';

export const getProgram = (connection: any, wallet: any) => {
  if (!wallet || !wallet.publicKey) {
    throw new Error("Wallet not connected");
  }

  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { preflightCommitment: 'confirmed' }
  );
  
  // Use the address from the IDL or a fallback
  const programId = new PublicKey(idl.address || "HTiYVYKAGyZptRer8Q3HGZY3ghjm5fo15BVwk7NtWyuA");
  
  return new anchor.Program(idl as any, provider);
};
