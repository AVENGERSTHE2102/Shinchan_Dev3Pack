'use client';

import { useState } from 'react';

export default function ProofForm({ dareId }: { dareId: string }) {
  const [proofUrl, setProofUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to submit proof
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Proof URL (Video/Image)"
        value={proofUrl}
        onChange={(e) => setProofUrl(e.target.value)}
        className="p-2 border rounded"
      />
      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Submit Proof
      </button>
    </form>
  );
}
