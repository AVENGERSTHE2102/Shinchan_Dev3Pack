"use client";

import { useEffect, useState } from "react";
import { useDare } from "@/hooks/useDare";
import { useSolDare } from "@/hooks/useSolDare";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/components/Toast";
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  Trophy,
  CheckCircle,
  Share2,
  ExternalLink,
  Zap,
  Send,
  Camera
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const PhantomConnectButton = dynamic(
  () => import("@/components/PhantomConnectButton"),
  { ssr: false }
);

const statusColors: any = {
  created: "bg-blue-500/20 text-blue-300 border-blue-500/20",
  accepted: "bg-cyan-500/20 text-cyan-300 border-cyan-400/20",
  proof_submitted: "bg-purple-500/20 text-purple-300 border-purple-500/20",
  paid: "bg-green-500/20 text-green-300 border-green-500/20",
  reclaimed: "bg-zinc-500/20 text-zinc-300 border-zinc-500/20",
};

export default function DarePage({ params }: { params: { id: string } }) {
  const { dare, loading: dareLoading, refresh } = useDare(params.id);
  const { acceptDare, approveDare } = useSolDare();
  const { publicKey } = useWallet();
  const { success, error, loading: loadingToast, dismiss } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [statusFlash, setStatusFlash] = useState(false);
  const [proofUrl, setProofUrl] = useState("");

  useEffect(() => {
    if (dare?.status) {
      setStatusFlash(true);
      const tid = setTimeout(() => setStatusFlash(false), 2000);
      return () => clearTimeout(tid);
    }
  }, [dare?.status]);

  if (dareLoading || !dare) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const isCreator = publicKey?.toBase58() === dare.creator_wallet;
  const isRecipient = publicKey?.toBase58() === dare.recipient_wallet;
  const hasExpired = new Date(dare.expires_at) < new Date();
  
  const dareHash = dare.metadata?.dare_hash;

  const handleAccept = async () => {
    if (!dareHash) {
      error("Data error", "Dare hash missing from record.");
      return;
    }
    const tid = loadingToast("Signing transaction...", "Please confirm in your wallet.");
    setLoading(true);
    try {
      const tx = await acceptDare(dare.creator_wallet, dareHash);
      
      await fetch("/api/dare/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dare_id: dare.id,
          recipient_wallet: publicKey?.toBase58(),
          accept_tx: tx,
        }),
      });

      await refresh();
      success("Dare accepted! ⚡", "Now submit your proof below.");
    } catch (err: any) {
      error("Action failed", err.message);
    } finally {
      dismiss(tid);
      setLoading(false);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl) return;

    const tid = loadingToast("Submitting proof...", "Uploading evidence.");
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

      await refresh();
      success("Proof submitted! 📸", "Waiting for creator approval.");
      setProofUrl("");
    } catch (err: any) {
      error("Submission failed", err.message);
    } finally {
      dismiss(tid);
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!dareHash) {
      error("Data error", "Dare hash missing from record.");
      return;
    }
    const tid = loadingToast("Approving payout...", "This will release the SOL bounty.");
    setLoading(true);
    try {
      const dummyProofHash = Array(32).fill(0);
      const tx = await approveDare(dare.creator_wallet, dareHash, dare.recipient_wallet, dummyProofHash);
      
      await fetch("/api/dare/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dare_id: dare.id,
          recipient: dare.recipient_wallet,
          bounty_lamports: dare.bounty_lamports,
          approve_tx: tx,
        }),
      });

      await refresh();
      success("Bounty released! 💸", "SOL has been transferred to the recipient.");
    } catch (err: any) {
      error("Approval failed", err.message);
    } finally {
      dismiss(tid);
      setLoading(false);
    }
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    success("Link copied!", "Share this dare with others.");
  };

  const title = dare.metadata?.title || dare.dare_text?.split('\n')[0] || "Challenge";
  const description = dare.metadata?.description || dare.dare_text?.split('\n').slice(1).join('\n') || dare.dare_text;

  return (
    <main className="min-h-screen bg-[#050505] text-white py-8 px-4 sm:py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="group flex items-center gap-2 text-zinc-500 hover:text-white transition">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Back to feed</span>
          </Link>
          <button onClick={handleShare} className="flex items-center gap-2 text-zinc-500 hover:text-white transition">
            <Share2 className="h-4 w-4" />
            <span className="text-sm font-medium">Share Dare</span>
          </button>
        </div>

        {/* Content Card */}
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 sm:p-10 backdrop-blur-xl">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-30" />

          <div className="relative z-10">
            {/* Top Row: Status + Reward */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div className={cn(
                "rounded-full border px-4 py-2 text-xs font-black tracking-widest uppercase transition-all duration-500",
                statusColors[dare.status] || statusColors.created,
                statusFlash && "scale-110 ring-2 ring-white/30"
              )}>
                {dare.status === "paid" ? "✅ Payout Complete" : dare.status.replace("_", " ")}
              </div>
              
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Bounty Reward</p>
                <div className="mt-1 flex items-center gap-3 justify-end">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-400">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <span className="text-3xl font-black tracking-tight text-cyan-400 sm:text-5xl">
                    {(dare.bounty_lamports / 1e9).toFixed(2)} <span className="text-xl font-bold">SOL</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-black leading-tight sm:text-5xl mb-6">
              {title}
            </h1>

            {/* Description */}
            <p className="text-zinc-400 text-lg leading-relaxed mb-10">
              {description}
            </p>

            {/* Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 p-6 rounded-2xl bg-black/40 border border-white/10">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-400">Creator:</span>
                  <span className="text-zinc-200 font-mono">{dare.creator_wallet.slice(0,6)}...{dare.creator_wallet.slice(-4)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  <span className="text-zinc-400">Expires:</span>
                  <span className="text-zinc-200 font-medium">{new Date(dare.expires_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {dare.recipient_wallet ? (
                  <div className="flex items-center gap-3 text-sm">
                    <Zap className="h-4 w-4 text-purple-400" />
                    <span className="text-zinc-400">Challenger:</span>
                    <span className="text-zinc-200 font-mono">{dare.recipient_wallet.slice(0,6)}...{dare.recipient_wallet.slice(-4)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-sm text-zinc-500 italic">
                    <Zap className="h-4 w-4" />
                    <span>Open for challenge</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Section */}
            <div className="mt-8 pt-8 border-t border-white/5">
              {!publicKey ? (
                <div className="text-center p-8 rounded-3xl border border-dashed border-white/10 bg-white/5">
                  <p className="text-zinc-400 mb-6 font-medium">Connect your wallet to interact</p>
                  <div className="flex justify-center">
                    <PhantomConnectButton />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* 1. Accept Dare */}
                  {dare.status === "created" && !hasExpired && !isCreator && (
                    <button
                      onClick={handleAccept}
                      disabled={loading}
                      className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-black text-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-95 transition"
                    >
                      {loading ? "Confirming..." : "⚡ ACCEPT CHALLENGE"}
                    </button>
                  )}

                  {/* 2. Submit Proof (INLINE) */}
                  {dare.status === "accepted" && isRecipient && !hasExpired && (
                    <div className="rounded-3xl bg-purple-500/10 border border-purple-500/20 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-3 mb-6">
                        <Camera className="h-6 w-6 text-purple-400" />
                        <h3 className="text-xl font-bold">Submit Evidence</h3>
                      </div>
                      <form onSubmit={handleSubmitProof} className="space-y-4">
                        <div className="relative">
                          <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <input
                            required
                            type="url"
                            placeholder="Link to your proof (X, Loom, etc.)"
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-purple-500/50 transition"
                            value={proofUrl}
                            onChange={(e) => setProofUrl(e.target.value)}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-4 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition"
                        >
                          <Send className="h-4 w-4 inline mr-2" />
                          {loading ? "Submitting..." : "Send Proof"}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* 3. Approve Payout */}
                  {dare.status === "proof_submitted" && isCreator && (
                    <div className="rounded-3xl bg-green-500/10 border border-green-500/20 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-6 w-6 text-green-400" />
                          <h3 className="text-xl font-bold">Proof Received</h3>
                        </div>
                        <a 
                          href={dare.proof_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-cyan-400 text-sm font-medium flex items-center gap-1 hover:underline"
                        >
                          View Evidence <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-green-500 to-green-400 text-black font-black text-xl shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-[1.02] active:scale-95 transition"
                      >
                        {loading ? "Releasing SOL..." : "✅ APPROVE & PAYOUT"}
                      </button>
                    </div>
                  )}

                  {/* Display existing proof if not creator (or creator after submission) */}
                  {dare.proof_url && (!isCreator || dare.status === "paid") && (
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium">Evidence Submitted</span>
                      </div>
                      <a href={dare.proof_url} target="_blank" rel="noreferrer" className="text-cyan-400">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}

                  {/* Status Messages */}
                  {dare.status === "created" && isCreator && (
                    <div className="text-center py-4 text-zinc-500 font-medium italic">
                      Waiting for someone to accept the dare...
                    </div>
                  )}
                  {dare.status === "accepted" && isCreator && !dare.proof_url && (
                    <div className="text-center py-4 text-purple-400 font-medium">
                      🚀 Dare Accepted! Waiting for challenger to submit proof.
                    </div>
                  )}
                  {dare.status === "paid" && (
                    <div className="text-center py-8 rounded-3xl bg-green-500/5 border border-green-500/10">
                      <Trophy className="h-10 w-10 text-green-400 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-white">Challenge Completed!</h3>
                      <p className="text-zinc-500 text-sm mt-1">Bounty has been successfully paid out.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
