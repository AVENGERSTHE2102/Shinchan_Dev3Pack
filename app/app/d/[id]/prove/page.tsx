"use client";

import ProofForm from "@/components/ProofForm";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProveDarePage({ params }: { params: { id: string } }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white py-12 px-6">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.15),transparent_35%)]" />
      <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-2xl">
        
        {/* Header */}
        <Link href={`/d/${params.id}`} className="group inline-flex items-center gap-2 text-zinc-500 hover:text-white transition mb-10">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to dare</span>
        </Link>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 backdrop-blur-xl">
          <Sparkles className="h-4 w-4" />
          Challenge Submission
        </div>

        <h1 className="text-5xl font-black mb-3 leading-tight">
          Submit Proof.
        </h1>
        <p className="text-zinc-400 mb-12 text-lg">
          Provide evidence of your completion to unlock the SOL reward.
        </p>

        <div className="relative">
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-xl" />
          <div className="relative rounded-[40px] border border-white/10 bg-[#0a0a0a] p-8 sm:p-12 shadow-2xl backdrop-blur-2xl">
            <ProofForm dareId={params.id} />
          </div>
        </div>

        <div className="mt-12 text-center text-zinc-500 text-sm">
          <p>By submitting, you agree that your proof is accurate and authentic.</p>
        </div>
      </div>
    </main>
  );
}
