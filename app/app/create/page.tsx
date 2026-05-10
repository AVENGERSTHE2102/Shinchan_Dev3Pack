import DareForm from "@/components/DareForm";
import { Sparkles, ShieldCheck, Trophy, Zap } from "lucide-react";
import Link from "next/link";

export default function CreatePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">

      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.15),transparent_35%)]" />
      <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-3xl" />


      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-10 lg:grid-cols-2 lg:items-start">

        {/* Left Side */}
        <div className="lg:sticky lg:top-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 backdrop-blur-xl">
            <Sparkles className="h-4 w-4" />
            Create an On-Chain Challenge
          </div>

          <h1 className="text-5xl font-black leading-tight md:text-7xl">
            Turn Ideas
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              {" "}
              Into SOL
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-400">
            Lock SOL rewards, challenge anyone on the internet, and automate payouts through secure Solana smart contracts.
          </p>

          <div className="mt-12 space-y-6">

            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="rounded-xl bg-cyan-500/10 p-3">
                <ShieldCheck className="h-6 w-6 text-cyan-400" />
              </div>

              <div>
                <h3 className="text-lg font-bold">Safe Escrow</h3>
                <p className="text-sm text-zinc-400">
                  Your SOL is held securely in a program-derived account until proof is verified.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="rounded-xl bg-purple-500/10 p-3">
                <Trophy className="h-6 w-6 text-purple-400" />
              </div>

              <div>
                <h3 className="text-lg font-bold">Automated Payouts</h3>
                <p className="text-sm text-zinc-400">
                  Once you approve the proof, the contract instantly transfers the reward.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="relative">
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-2xl" />

          <div className="relative rounded-[32px] border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl backdrop-blur-2xl">

            <div className="mb-8">
              <h2 className="text-3xl font-black">
                Launch Challenge
              </h2>

              <p className="mt-2 text-zinc-400">
                Define the rules and lock the reward.
              </p>
            </div>

            <DareForm />
          </div>
        </div>
      </div>
    </main>
  );
}