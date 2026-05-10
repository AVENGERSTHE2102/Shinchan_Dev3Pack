"use client";

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { getProgram } from '../lib/anchor-client';
import { PublicKey } from '@solana/web3.js';

export const useSolDare = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (wallet.publicKey) {
      return getProgram(connection, wallet);
    }
    return null;
  }, [connection, wallet]);

  const createDare = async (dareId: string, bountyLamports: number, dareHash: number[], expiresInSeconds: number = 86400) => {
    if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
    // Mocked on-chain call
    return await (program.methods as any).createDare().accounts({}).rpc();
  };

  const acceptDare = async (creatorPubkey: string, dareHash: number[]) => {
    if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
    // Mocked on-chain call
    return await (program.methods as any).acceptDare().accounts({}).rpc();
  };

  const approveDare = async (creatorPubkey: string, dareHash: number[], recipient: string, proofHash: number[]) => {
    if (!program || !wallet.publicKey) throw new Error("Wallet not connected");
    // Mocked on-chain call
    return await (program.methods as any).approveDare().accounts({}).rpc();
  };

  return { program, createDare, acceptDare, approveDare };
};
