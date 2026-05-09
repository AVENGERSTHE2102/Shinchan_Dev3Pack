import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from '../idl/soldare.json';

export const getProgram = (connection: Connection, wallet: any) => {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: 'confirmed',
  });
  return new anchor.Program(idl as any, provider);
};
