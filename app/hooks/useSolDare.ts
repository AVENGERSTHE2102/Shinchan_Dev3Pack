"use client";

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, TransactionInstruction, PublicKey, SystemProgram } from '@solana/web3.js';
import { Buffer } from 'buffer';

const PROGRAM_ID = new PublicKey("HTiYVYKAGyZptRer8Q3HGZY3ghjm5fo15BVwk7NtWyuA");

export const useSolDare = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const getDareHashArray = (dare_hash: any) => {
    if (Array.isArray(dare_hash)) return dare_hash;
    if (typeof dare_hash === 'object' && dare_hash !== null) {
      return Object.keys(dare_hash).sort((a,b) => Number(a)-Number(b)).map(k => dare_hash[k]);
    }
    return [];
  };

  const executeTransaction = async (instruction: TransactionInstruction) => {
    if (!wallet.publicKey || !wallet.sendTransaction) throw new Error("Wallet not connected");

    const transaction = new Transaction().add(instruction);
    
    try {
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      return signature;
    } catch (error: any) {
      console.error("❌ Phantom Transaction Error:", error);
      if (error.logs) console.error("📝 Simulation Logs:", error.logs);
      throw error;
    }
  };

  const createDare = async (dareId: string, bountyLamports: number, dareHash: number[], expiresInSeconds: number = 86400) => {
    if (!wallet.publicKey) throw new Error("Wallet not connected");

    const dareHashArray = getDareHashArray(dareHash);
    const [darePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("dare"), wallet.publicKey.toBuffer(), Buffer.from(dareHashArray)],
      PROGRAM_ID
    );

    const dareIdBuffer = Buffer.from(dareId, "utf-8");
    const data = Buffer.alloc(8 + 32 + 8 + 8 + 4 + dareIdBuffer.length);
    let offset = 0;

    Buffer.from([0xa5, 0xf8, 0x07, 0x1b, 0x63, 0xbb, 0x19, 0xc6]).copy(data, offset); offset += 8;
    Buffer.from(dareHashArray).copy(data, offset); offset += 32;
    data.writeBigUInt64LE(BigInt(bountyLamports), offset); offset += 8;
    data.writeBigInt64LE(BigInt(expiresInSeconds), offset); offset += 8;
    data.writeUInt32LE(dareIdBuffer.length, offset); offset += 4;
    dareIdBuffer.copy(data, offset);

    const instruction = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: darePDA, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    return executeTransaction(instruction);
  };

  const acceptDare = async (creatorPubkeyStr: string, dareHash: number[]) => {
    if (!wallet.publicKey) throw new Error("Wallet not connected");
    const creator = new PublicKey(creatorPubkeyStr);
    const dareHashArray = getDareHashArray(dareHash);

    const [darePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("dare"), creator.toBuffer(), Buffer.from(dareHashArray)],
      PROGRAM_ID
    );

    const data = Buffer.from([0xee, 0x7b, 0x48, 0x67, 0x9f, 0xea, 0xd2, 0x53]);

    const instruction = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: darePDA, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
      ],
      data,
    });

    return executeTransaction(instruction);
  };

  const approveDare = async (creatorPubkeyStr: string, dareHash: number[], recipientPubkeyStr: string, proofHash: number[]) => {
    if (!wallet.publicKey) throw new Error("Wallet not connected");
    const creator = new PublicKey(creatorPubkeyStr);
    const recipient = new PublicKey(recipientPubkeyStr);
    const dareHashArray = getDareHashArray(dareHash);
    const proofHashArray = getDareHashArray(proofHash);

    const [darePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("dare"), creator.toBuffer(), Buffer.from(dareHashArray)],
      PROGRAM_ID
    );

    const data = Buffer.alloc(8 + 32);
    Buffer.from([0x4b, 0xd9, 0x72, 0xd4, 0x27, 0x80, 0xfe, 0xbe]).copy(data, 0);
    Buffer.from(proofHashArray).copy(data, 8);

    const instruction = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: darePDA, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: recipient, isSigner: false, isWritable: true },
      ],
      data,
    });

    return executeTransaction(instruction);
  };

  return { createDare, acceptDare, approveDare };
};
