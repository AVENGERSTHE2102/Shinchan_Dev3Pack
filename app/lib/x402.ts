type PayoutPayload = {
  dare_id: string;
  recipient?: string;
  bounty_usdc_cents?: number;
};

type ApprovePayload = {
  dare_id: string;
  recipient: string;
  bounty_usdc_cents: number;
  approve_tx?: string;
};

export const triggerPayout = async (payload: PayoutPayload) => {
  const response = await fetch('/api/dare/payout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
};

export const triggerApproveFallback = async (payload: ApprovePayload) => {
  const response = await fetch('/api/dare/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
};
