"use client";

import { useState } from "react";
import { useDare } from "@/hooks/useDare";
import { useToast } from "@/components/Toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Send, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const PhantomConnectButton = dynamic(
  () => import("@/components/PhantomConnectButton"),
  { ssr: false }
);

export default function ProvePage({ params }: { params: { id: string } }) {
  const { dare } = useDare(params.id);
  const { success, error, loading: loadingToast, dismiss } = useToast();
  const { publicKey } = useWallet();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [proofUrl, setProofUrl] = useState("");

  if (!dare) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const isRecipient = publicKey?.toBase58() === dare.recipient_wallet;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRecipient) {
      error("Unauthorized", "Only the challenger can submit proof.");
      return;
    }

    const tid = loadingToast("Submitting proof...", "Updating dare status.");
    setLoading(true);

    try {
      const res = await fetch("/api/dare/prove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dare_id: dare.id,
          proof_url: proofUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit proof");

      success("Proof submitted! 📸", "The creator has been notified to approve the payout.");
      router.push(`/d/${dare.id}`);
    } catch (err: any) {
      error("Submission failed", err.message);
    } finally {
      dismiss(tid);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white py-12 px-6">
      <div className="mx-auto max-w-2xl">
        
        <Link href={`/d/${dare.id}`} className="group mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to dare</span>
        </Link>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2">Submit Proof</h1>
            <p className="text-zinc-400">Share the evidence that you've completed the challenge.</p>
          </div>

          <div className="mb-8 p-6 rounded-2xl bg-black/40 border border-white/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">Challenge</h3>
            <p className="text-xl font-bold text-white">{dare.metadata?.title || dare.dare_text?.split('\n')[0]}</p>
          </div>

          {!publicKey ? (
            <div className="text-center p-10 rounded-2xl border border-dashed border-white/10">
              <p className="text-zinc-400 mb-6">Please connect your wallet to submit proof.</p>
              <div className="flex justify-center">
                <PhantomConnectButton />
              </div>
            </div>
          ) : !isRecipient ? (
            <div className="text-center p-10 rounded-2xl bg-red-500/10 border border-red-500/20">
              <ShieldCheck className="h-10 w-10 text-red-400 mx-auto mb-4" />
              <p className="text-red-200 font-bold">You are not the designated challenger for this dare.</p>
              <p className="text-red-300/60 text-sm mt-2">Only the wallet that accepted the dare can submit proof.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Evidence URL (Image/Video/Tweet)</label>
                <div className="relative">
                  <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <input
                    required
                    type="url"
                    placeholder="https://x.com/status/..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-cyan-500/50 focus:ring-0 transition"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-400 text-white font-black text-xl shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
              >
                {loading ? "SUBMITTING..." : "🚀 SUBMIT PROOF"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
