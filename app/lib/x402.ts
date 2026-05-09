// x402 facilitator helpers placeholder
export const triggerPayout = async (dareId: string) => {
  const response = await fetch('/api/dare/payout', {
    method: 'POST',
    body: JSON.stringify({ dareId }),
  });
  return response.json();
};
