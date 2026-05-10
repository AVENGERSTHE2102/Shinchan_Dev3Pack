"use client";

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { getProgram } from '../lib/anchor-client';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';

export const useSolDare = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (wallet.publicKey) {
      return getProgram(connection, wallet);
    }
    return null;
  }, [connection, wallet]);

  const createDare = async (dareId: string, bountyLamports: number, dareHash: number[]) => {
    if (!program || !wallet.publicKey) throw new Error("Wallet not connected");

    const [darePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dare"), Buffer.from(dareId)],
      program.programId
    );

    const tx = await program.methods
      .createDare(dareHash, new anchor.BN(bountyLamports))
      .accounts({
        dare: darePda,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return tx;
  };

  const acceptDare = async (dareId: string) => {
    if (!program || !wallet.publicKey) throw new Error("Wallet not connected");

    const [darePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dare"), Buffer.from(dareId)],
      program.programId
    );

    const tx = await program.methods
      .acceptDare()
      .accounts({
        dare: darePda,
        recipient: wallet.publicKey,
      } as any)
      .rpc();

    return tx;
  };

  const approveDare = async (dareId: string, recipient: string, proofHash: number[]) => {
    if (!program || !wallet.publicKey) throw new Error("Wallet not connected");

    const [darePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dare"), Buffer.from(dareId)],
      program.programId
    );

    const tx = await program.methods
      .approveDare(proofHash)
      .accounts({
        dare: darePda,
        creator: wallet.publicKey,
        recipient: new PublicKey(recipient),
      } as any)
      .rpc();

    return tx;
  };

  return { program, createDare, acceptDare, approveDare };
};
