// Mock Anchor Client to avoid 'Expected Buffer' errors while preserving UI functionality
export const getProgram = (connection: any, wallet: any) => {
  console.warn("Anchor Program is currently MOCKED due to Buffer polyfill issues.");
  return {
    programId: { toBase58: () => "HTiYVYKAGyZptRer8Q3HGZY3ghjm5fo15BVwk7NtWyuA" },
    methods: {
      createDare: () => ({ accounts: () => ({ rpc: async () => "MOCKED_TX_CREATE" }) }),
      acceptDare: () => ({ accounts: () => ({ rpc: async () => "MOCKED_TX_ACCEPT" }) }),
      approveDare: () => ({ accounts: () => ({ rpc: async () => "MOCKED_TX_APPROVE" }) }),
    }
  };
};
