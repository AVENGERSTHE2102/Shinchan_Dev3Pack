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
  const { dare } = useDare(params.id);
  const { acceptDare, approveDare } = useSolDare();
  const { publicKey } = useWallet();
  const { success, error, loading: loadingToast, dismiss } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [statusFlash, setStatusFlash] = useState(false);

  useEffect(() => {
    if (dare?.status) {
      setStatusFlash(true);
      const tid = setTimeout(() => setStatusFlash(false), 2000);
      return () => clearTimeout(tid);
    }
  }, [dare?.status]);

  if (!dare) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const isCreator = publicKey?.toBase58() === dare.creator_wallet;
  const isRecipient = publicKey?.toBase58() === dare.recipient_wallet;
  const hasExpired = new Date(dare.expires_at) < new Date();

  const handleAccept = async () => {
    const tid = loadingToast("Signing transaction...", "Please confirm in your wallet.");
    setLoading(true);
    try {
      const tx = await acceptDare(dare.id);
      success("Dare accepted! ⚡", "You are now the challenger. Good luck!");
    } catch (err: any) {
      error("Action failed", err.message);
    } finally {
      dismiss(tid);
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    const tid = loadingToast("Approving payout...", "This will release the SOL bounty.");
    setLoading(true);
    try {
      // Create a dummy proof hash for now
      const dummyProofHash = Array(32).fill(0);
      const tx = await approveDare(dare.id, dare.recipient_wallet, dummyProofHash);
      
      // Update DB status to paid
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
              {dare.title}
            </h1>

            {/* Description */}
            <p className="text-zinc-400 text-lg leading-relaxed mb-10">
              {dare.description}
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

            {/* Proof Section */}
            {dare.proof_url && (
              <div className="mb-10 rounded-2xl bg-green-500/5 border border-green-500/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Proof Submitted</h3>
                </div>
                <a 
                  href={dare.proof_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="group flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5 hover:border-cyan-500/30 transition"
                >
                  <span className="text-cyan-400 font-medium truncate mr-4">{dare.proof_url}</span>
                  <ExternalLink className="h-4 w-4 text-zinc-500 group-hover:text-cyan-400" />
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              {!publicKey ? (
                <div className="text-center p-8 rounded-3xl border border-dashed border-white/10 bg-white/5">
                  <p className="text-zinc-400 mb-6 font-medium">Connect your wallet to interact with this dare</p>
                  <div className="flex justify-center">
                    <PhantomConnectButton />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Accept Logic */}
                  {dare.status === "created" && !hasExpired && !isCreator && (
                    <button
                      onClick={handleAccept}
                      disabled={loading}
                      className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-black text-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
                    >
                      {loading ? "Confirming..." : "⚡ ACCEPT CHALLENGE"}
                    </button>
                  )}

                  {/* Proof Logic */}
                  {dare.status === "accepted" && isRecipient && !hasExpired && (
                    <Link href={`/d/${dare.id}/prove`}>
                      <button className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-400 text-white font-black text-xl shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:scale-[1.02] active:scale-95 transition">
                        📸 SUBMIT PROOF
                      </button>
                    </Link>
                  )}

                  {/* Approve Logic */}
                  {dare.status === "proof_submitted" && isCreator && (
                    <button
                      onClick={handleApprove}
                      disabled={loading}
                      className="w-full py-5 rounded-2xl bg-gradient-to-r from-green-500 to-green-400 text-black font-black text-xl shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "✅ APPROVE & PAYOUT"}
                    </button>
                  )}

                  {/* Wait States */}
                  {dare.status === "created" && isCreator && (
                    <div className="text-center py-4 text-zinc-500 font-medium italic border-t border-white/5">
                      Waiting for someone to accept the dare...
                    </div>
                  )}
                  {dare.status === "accepted" && isCreator && !dare.proof_url && (
                    <div className="text-center py-4 text-zinc-500 font-medium italic border-t border-white/5">
                      Accepted! Waiting for proof submission...
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
