"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import PhantomConnectButton from "./PhantomConnectButton";
import { useSolDare } from "../hooks/useSolDare";
import { useToast } from "./Toast";
import { solToLamports } from "../lib/utils";

export default function DareForm() {
  const { publicKey } = useWallet();
  const { createDare } = useSolDare();
  const { success, error, loading: toastLoading, dismiss } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    dare_text: "",
    bounty_sol: "",
    expires_in_days: "1",
    recipient_wallet: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey) return error("Wallet not connected", "Connect a supported Solana wallet first.");

    setLoading(true);
    const tid = toastLoading("Creating dare on-chain...", "Approve the transaction in your wallet");

    try {
      const dareId = crypto.randomUUID();
      const hashInput = Uint8Array.from(new TextEncoder().encode(formData.dare_text));
      const hashBuffer = await crypto.subtle.digest("SHA-256", hashInput);
      const dareHash = Array.from(new Uint8Array(hashBuffer));

      const collateralLamports = solToLamports(parseFloat(formData.bounty_sol));
      const expiresInSeconds = parseInt(formData.expires_in_days) * 24 * 60 * 60;

      await createDare(dareHash, collateralLamports, expiresInSeconds, dareId);

      const expiresAtDate = new Date();
      expiresAtDate.setSeconds(expiresAtDate.getSeconds() + expiresInSeconds);

      const res = await fetch("/api/dare/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: dareId,
          creator_wallet: publicKey.toString(),
          recipient_wallet: formData.recipient_wallet || undefined,
          dare_text: formData.dare_text,
          bounty_lamports: collateralLamports,
          expires_at: expiresAtDate.toISOString(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Failed to save dare to database");
      }

      dismiss(tid);
      success("Dare created! 🎉", "Your dare is live on Solana. Redirecting...");
      setTimeout(() => router.push(`/d/${dareId}`), 1000);
    } catch (err: any) {
      dismiss(tid);
      console.error(err);
      error("Failed to create dare", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!publicKey && (
        <div className="mb-2 rounded-[28px] border border-cyan-400/15 bg-cyan-400/[0.08] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Connect a wallet to fund the dare</p>
              <p className="mt-1 text-xs text-cyan-50/70">
                Phantom is preferred, but Solflare is supported for quick switching during testing.
              </p>
            </div>
            <PhantomConnectButton className="sm:min-w-[14rem]" />
          </div>
        </div>
      )}

      <textarea
        placeholder="Describe the challenge (e.g., Do 100 pushups in under 2 minutes)"
        className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-500 focus:outline-none transition resize-none text-sm"
        rows={4}
        required
        value={formData.dare_text}
        onChange={(e) => setFormData({ ...formData, dare_text: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Reward (SOL)</label>
          <input
            type="number"
            placeholder="e.g. 0.5"
            required
            min="0.001"
            step="0.001"
            className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-500 focus:outline-none transition text-sm"
            value={formData.bounty_sol}
            onChange={(e) => setFormData({ ...formData, bounty_sol: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Expires (Days)</label>
          <input
            type="number"
            placeholder="1–7"
            required
            min="1"
            max="7"
            className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-500 focus:outline-none transition text-sm"
            value={formData.expires_in_days}
            onChange={(e) => setFormData({ ...formData, expires_in_days: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Recipient Wallet (Optional)</label>
        <input
          type="text"
          placeholder="Leave blank for anyone to accept"
          className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-500 focus:outline-none transition text-sm"
          value={formData.recipient_wallet}
          onChange={(e) => setFormData({ ...formData, recipient_wallet: e.target.value })}
        />
      </div>

      <button
        disabled={loading || !publicKey}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:scale-[1.02] active:scale-95 transition font-bold text-sm disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        {loading ? "Creating on-chain..." : "Lock SOL & Create Dare"}
      </button>

      {!publicKey && (
        <p className="text-center text-xs text-zinc-500">Connect a wallet before creating the on-chain escrow</p>
      )}
    </form>
  );
}
