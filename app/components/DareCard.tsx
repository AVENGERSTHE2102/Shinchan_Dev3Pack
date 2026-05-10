"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ExternalLink, Trophy } from "lucide-react";
import { lamportsToSol } from "@/lib/utils";

interface DareCardProps {
  dare: {
    id: string;
    title: string;
    bounty_lamports: number;
    status: string;
    creator_wallet: string;
    expires_at: string;
  };
}

export default function DareCard({ dare }: DareCardProps) {
  const statusColors: any = {
    created: "bg-blue-500/20 text-blue-300 border-blue-500/20",
    accepted: "bg-cyan-500/20 text-cyan-300 border-cyan-400/20",
    paid: "bg-green-500/20 text-green-300 border-green-500/20",
    reclaimed: "bg-zinc-500/20 text-zinc-300 border-zinc-500/20",
  };

  const formattedDate = new Date(dare.expires_at).toLocaleDateString();

  return (
    <Link href={`/d/${dare.id}`}>
      <motion.div
        whileHover={{ y: -5, scale: 1.01 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-cyan-400/40"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 transition group-hover:opacity-100" />
        
        <div className="flex items-start justify-between">
          <div className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusColors[dare.status] || statusColors.created}`}>
            {dare.status}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Clock className="h-3 w-3" />
            {formattedDate}
          </div>
        </div>

        <h3 className="mt-5 text-2xl font-bold leading-tight text-white line-clamp-2">
          {dare.title}
        </h3>

        <div className="mt-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Reward</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-400">
                <Trophy className="h-3 w-3" />
              </div>
              <span className="text-3xl font-black tracking-tight text-cyan-400">
                {lamportsToSol(dare.bounty_lamports).toFixed(2)} <span className="text-lg font-bold">SOL</span>
              </span>
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-zinc-400 transition group-hover:bg-white group-hover:text-black">
            <ExternalLink className="h-5 w-5" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
