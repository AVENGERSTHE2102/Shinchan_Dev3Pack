"use client";

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';

export const useSolDare = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  /**
   * Helper to fetch and sign a transaction built on the server
   * USES ZERO BUFFER - Native Browser only
   */
  const signAndSendServerTx = async (apiUrl: string, body: any) => {
    if (!wallet.publicKey || !wallet.sendTransaction) {
      throw new Error("Wallet not connected");
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        user_wallet: wallet.publicKey.toBase58()
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    // Decode Base64 to Uint8Array WITHOUT using Buffer
    const binaryString = window.atob(data.transaction);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Reconstruct the transaction
    const transaction = Transaction.from(bytes);
    
    // Sign and Send via Wallet Adapter
    const signature = await wallet.sendTransaction(transaction, connection);
    
    // Confirm
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  };

  const createDare = async (dareId: string, bountyLamports: number, dareHash: number[], expiresInSeconds: number = 86400) => {
    return signAndSendServerTx('/api/tx/create', {
      creator_wallet: wallet.publicKey?.toBase58(),
      dare_id: dareId,
      bounty_lamports: bountyLamports,
      dare_hash: dareHash,
      expires_in_seconds: expiresInSeconds
    });
  };

  const acceptDare = async (creatorPubkey: string, dareHash: number[]) => {
    return signAndSendServerTx('/api/tx/accept', {
      creator_wallet: creatorPubkey,
      recipient_wallet: wallet.publicKey?.toBase58(),
      dare_hash: dareHash
    });
  };

  const approveDare = async (creatorPubkey: string, dareHash: number[], recipientPubkey: string, proofHash: number[]) => {
    return signAndSendServerTx('/api/tx/approve', {
      creator_wallet: wallet.publicKey?.toBase58(),
      recipient_wallet: recipientPubkey,
      dare_hash: dareHash,
      proof_hash: proofHash
    });
  };

  return { createDare, acceptDare, approveDare };
};
