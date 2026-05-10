"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { Link2, Camera, Upload, CheckCircle2 } from "lucide-react";

export default function ProofForm({ dareId }: { dareId: string }) {
  const router = useRouter();
  const { success, error, loading: loadingToast, dismiss } = useToast();
  const [loading, setLoading] = useState(false);
  const [proofUrl, setProofUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!proofUrl) return;

    const tid = loadingToast("Submitting proof...", "Updating challenge status.");
    setLoading(true);

    try {
      const res = await fetch("/api/dare/prove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dare_id: dareId, proof_url: proofUrl }),
      });

      if (!res.ok) throw new Error("Failed to submit proof");

      success("Proof Submitted! 🎉", "Wait for the creator to approve your payout.");
      router.push(`/d/${dareId}`);
    } catch (err: any) {
      error("Submission failed", err.message);
    } finally {
      dismiss(tid);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Proof URL (X, Video, Image)</label>
        <div className="relative">
          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <input
            required
            type="url"
            placeholder="https://x.com/your-proof-post"
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-cyan-500/50 focus:ring-0 transition"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
          <Upload className="h-6 w-6 text-zinc-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-300">File uploads coming soon</p>
          <p className="text-xs text-zinc-500 mt-1">For now, please provide a link to your proof.</p>
        </div>
      </div>

      <button
        disabled={loading || !proofUrl}
        className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-black text-xl shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
      >
        {loading ? "SUBMITTING..." : "CONFIRM PROOF 📸"}
      </button>

      <div className="flex items-center gap-2 justify-center text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
        <CheckCircle2 className="h-3 w-3" />
        <span>Proof will be public for audit</span>
      </div>
    </form>
  );
}
