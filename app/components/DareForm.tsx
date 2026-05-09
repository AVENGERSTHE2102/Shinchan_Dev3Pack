'use client';

import { useState } from 'react';

export default function DareForm() {
  const [dareText, setDareText] = useState('');
  const [bounty, setBounty] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to create dare
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="What's the dare?"
        value={dareText}
        onChange={(e) => setDareText(e.target.value)}
        className="p-2 border rounded"
      />
      <input
        type="number"
        placeholder="Bounty (SOL)"
        value={bounty}
        onChange={(e) => setBounty(Number(e.target.value))}
        className="p-2 border rounded"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Create Dare
      </button>
    </form>
  );
}
