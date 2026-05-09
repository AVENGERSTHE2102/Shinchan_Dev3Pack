import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { getProgram } from '../lib/anchor-client';

export const useSolDare = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (wallet.publicKey) {
      return getProgram(connection, wallet);
    }
    return null;
  }, [connection, wallet]);

  return { program };
};
