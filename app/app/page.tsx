"use client";

import DareCard from "@/components/DareCard";
import { useDares } from "@/hooks/useDares";
import {
  ShieldCheck,
  Trophy,
  Zap,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import dynamic from "next/dynamic";
import { lamportsToSol } from "@/lib/utils";

const PhantomConnectButton = dynamic(
  () => import("@/components/PhantomConnectButton"),
  { ssr: false }
);

export default function HomePage() {
  const { dares, loading } = useDares();

  const stats = {
    total: dares.length,
    active: dares.filter((d) => d.status === "created" || d.status === "accepted").length,
    paid: dares.filter((d) => d.status === "paid").length,
    totalPaidLamports: dares
      .filter((d) => d.status === "paid")
      .reduce((acc, curr) => acc + (curr.bounty_lamports || 0), 0),
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">

      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.15),transparent_35%)]" />
      <div className="absolute top-0 left-1/2 h-[400px] w-[400px] md:h-[500px] md:w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[300px] w-[300px] md:h-[400px] md:w-[400px] rounded-full bg-purple-500/10 blur-3xl" />


      {/* Hero */}
      <section className="relative z-10 flex min-h-[85vh] items-center px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-20 lg:grid-cols-2 lg:items-center">

          {/* Left */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 backdrop-blur-xl">
              <Sparkles className="h-4 w-4" />
              Social Challenges on Solana
            </div>

            <h1 className="text-6xl font-black leading-none md:text-8xl">
              Dare
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Anything.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-400">
              Lock crypto rewards, challenge your friends, submit proof, and automate payouts entirely on-chain.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a href="/create">
                <button className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 px-8 py-4 text-lg font-bold transition hover:scale-[1.03]">
                  Create Dare
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </button>
              </a>

              <a
                href="#live-dares"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg transition hover:bg-white/10"
              >
                Browse Dares
              </a>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-4">

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <p className="text-sm text-zinc-500">Total Dares</p>
                <h3 className="mt-2 text-3xl font-black">
                  {loading ? "..." : stats.total}
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <p className="text-sm text-zinc-500">SOL Paid</p>
                <h3 className="mt-2 text-3xl font-black text-green-400">
                  {loading ? "..." : lamportsToSol(stats.totalPaidLamports).toFixed(2)}
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <p className="text-sm text-zinc-500">Active</p>
                <h3 className="mt-2 text-3xl font-black text-cyan-400">
                  {loading ? "..." : stats.active}
                </h3>
              </div>
            </div>
          </div>

          {/* Right Hero Card */}
          <div className="relative">
            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-3xl" />

            <div className="relative rounded-[40px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">

              <div className="flex items-center justify-between">
                <span className="rounded-full bg-cyan-500/20 px-4 py-2 text-sm text-cyan-300">
                  FEATURED
                </span>

                <span className="text-sm text-zinc-400 italic">
                  powered by Anchor
                </span>
              </div>

              <h2 className="mt-8 text-5xl font-black leading-tight">
                Build an AI startup MVP in 48 hours.
              </h2>

              <p className="mt-6 text-zinc-400 leading-relaxed">
                Complete the challenge, upload proof, and instantly unlock your SOL payout.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4">

                <div className="rounded-2xl bg-black/40 p-5 border border-white/10">
                  <p className="text-sm text-zinc-500">Reward</p>
                  <h3 className="mt-2 text-4xl font-black text-cyan-400">
                    1.5 SOL
                  </h3>
                </div>

                <div className="rounded-2xl bg-black/40 p-5 border border-white/10">
                  <p className="text-sm text-zinc-500">Timeline</p>
                  <h3 className="mt-2 text-4xl font-black text-purple-400">
                    48h
                  </h3>
                </div>
              </div>

              <a href="/create" className="block mt-8">
                <button className="w-full rounded-2xl bg-white py-4 text-lg font-bold text-black transition hover:scale-[1.02]">
                  Try Now
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative z-10 mx-auto max-w-7xl px-6 py-24"
      >
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-black">
            Why SolDare?
          </h2>

          <p className="mt-6 text-lg text-zinc-400">
            Challenge infrastructure powered by Solana.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="w-fit rounded-2xl bg-cyan-500/10 p-4">
              <ShieldCheck className="h-8 w-8 text-cyan-400" />
            </div>

            <h3 className="mt-6 text-2xl font-bold">
              On-Chain Escrow
            </h3>

            <p className="mt-4 leading-relaxed text-zinc-400">
              Rewards remain securely locked until proof gets verified.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="w-fit rounded-2xl bg-purple-500/10 p-4">
              <Trophy className="h-8 w-8 text-purple-400" />
            </div>

            <h3 className="mt-6 text-2xl font-bold">
              Instant Payouts
            </h3>

            <p className="mt-4 leading-relaxed text-zinc-400">
              Smart contracts enable automated reward distribution with zero friction.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="w-fit rounded-2xl bg-cyan-500/10 p-4">
              <Zap className="h-8 w-8 text-cyan-400" />
            </div>

            <h3 className="mt-6 text-2xl font-bold">
              Public Proof System
            </h3>

            <p className="mt-4 leading-relaxed text-zinc-400">
              Anyone can view challenge progress through shareable public links.
            </p>
          </div>
        </div>
      </section>

      {/* Dares */}
      <section
        id="live-dares"
        className="relative z-10 mx-auto max-w-7xl px-6 py-24"
      >
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-5xl font-black">
              Live Dares
            </h2>

            <p className="mt-4 text-zinc-400">
              Trending public challenges happening now.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {loading && <RefreshCw className="h-5 w-5 animate-spin text-cyan-400" />}
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-cyan-300">
              {stats.active} Active
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : dares.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-white/10 bg-white/5">
            <Trophy className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-400">No active dares found</h3>
            <p className="text-zinc-500 mt-2">Start the first challenge on SolDare!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {dares.map((dare) => (
              <DareCard key={dare.id} dare={dare} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}