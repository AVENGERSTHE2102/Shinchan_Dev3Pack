"use client";

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { getProgram } from '../lib/anchor-client';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

export const useSolDare = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (wallet.publicKey) {
      return getProgram(connection, wallet);
    }
    return null;
  }, [connection, wallet]);

  /**
   * Helper to derive the Dare PDA
   */
  const getDarePDA = (creator: PublicKey, dareHash: number[]) => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("dare"),
        creator.toBuffer(),
        Buffer.from(new Uint8Array(dareHash))
      ],
      program!.programId
    )[0];
  };

  const createDare = async (dareId: string, bountyLamports: number, dareHash: number[], expiresInSeconds: number = 86400) => {
    if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
    
    const darePDA = getDarePDA(wallet.publicKey, dareHash);
    
    return await program.methods
      .createDare(
        dareHash, 
        new anchor.BN(bountyLamports), 
        new anchor.BN(expiresInSeconds), 
        dareId
      )
      .accounts({
        dareAccount: darePDA,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  };

  const acceptDare = async (creatorPubkey: string, dareHash: number[]) => {
    if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
    
    const creator = new PublicKey(creatorPubkey);
    const darePDA = getDarePDA(creator, dareHash);
    
    return await program.methods
      .acceptDare()
      .accounts({
        dareAccount: darePDA,
        recipient: wallet.publicKey,
      })
      .rpc();
  };

  const approveDare = async (creatorPubkey: string, dareHash: number[], recipientPubkey: string, proofHash: number[]) => {
    if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
    
    const creator = new PublicKey(creatorPubkey);
    const recipient = new PublicKey(recipientPubkey);
    const darePDA = getDarePDA(creator, dareHash);
    
    return await program.methods
      .approveDare(proofHash)
      .accounts({
        dareAccount: darePDA,
        creator: wallet.publicKey,
        recipient: recipient,
      })
      .rpc();
  };

  return { program, createDare, acceptDare, approveDare };
};
