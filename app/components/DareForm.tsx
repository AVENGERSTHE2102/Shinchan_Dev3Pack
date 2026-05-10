"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSolDare } from "@/hooks/useSolDare";
import { useToast } from "@/components/Toast";
import { solToLamports } from "@/lib/utils";
import { Coins, Calendar, User, FileText, Zap } from "lucide-react";

export default function DareForm() {
  const { publicKey } = useWallet();
  const { createDare } = useSolDare();
  const { success, error, loading: loadingToast, dismiss } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: "", // In SOL
    recipient: "",
    expiry: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey) {
      error("Wallet not connected", "Please connect your wallet to create a dare.");
      return;
    }

    const tid = loadingToast("Creating Dare...", "Confirming transaction on-chain.");
    setLoading(true);

    try {
      const bountyLamports = solToLamports(Number(formData.reward));
      
      // 1. Create entry in Supabase to get UUID
      const res = await fetch("/api/dare/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creator_wallet: publicKey.toBase58(),
          recipient_wallet: formData.recipient || null,
          title: formData.title,
          description: formData.description,
          bounty_lamports: bountyLamports,
          expires_at: new Date(formData.expiry).toISOString(),
        }),
      });

      const dbData = await res.json();
      if (!res.ok) throw new Error(dbData.error || "Failed to create dare in database");

      const dareId = dbData.id;
      
      // 2. On-chain transaction
      // For the dareHash, we'll use a dummy for now or hash the title
      const dummyHash = Array(32).fill(0);
      await createDare(dareId, bountyLamports, dummyHash);

      success("Dare Created! ⚡", "Your challenge is live and bounty is escrowed.");
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        reward: "",
        recipient: "",
        expiry: "",
      });
    } catch (err: any) {
      error("Creation failed", err.message);
    } finally {
      dismiss(tid);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Challenge Title</label>
        <div className="relative">
          <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <input
            required
            type="text"
            placeholder="e.g. Build a 100x memecoin"
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-cyan-500/50 focus:ring-0 transition"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Description & Requirements</label>
        <div className="relative">
          <FileText className="absolute left-4 top-4 h-5 w-5 text-zinc-500" />
          <textarea
            required
            placeholder="Describe exactly what needs to be done..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-cyan-500/50 focus:ring-0 transition min-h-[120px]"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reward */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Bounty (SOL)</label>
          <div className="relative">
            <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400" />
            <input
              required
              type="number"
              step="0.01"
              placeholder="0.5"
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:border-cyan-500/50 focus:ring-0 transition"
              value={formData.reward}
              onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
            />
          </div>
        </div>

        {/* Expiry */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Expires On</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              required
              type="date"
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-cyan-500/50 focus:ring-0 transition"
              value={formData.expiry}
              onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Recipient (Optional) */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Target Recipient (Optional)</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Wallet Address (leave blank for public dare)"
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-mono text-sm focus:border-cyan-500/50 focus:ring-0 transition"
            value={formData.recipient}
            onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 mt-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-black text-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
      >
        {loading ? "PROCESSING..." : "LAUNCH DARE 🚀"}
      </button>

      {!publicKey && (
        <p className="text-center text-xs text-red-400 font-bold animate-pulse">
          Connect your wallet to launch the dare!
        </p>
      )}
    </form>
  );
}
