"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface DareCardProps {
  dare: {
    id: string;
    title: string;
    reward: number;
    status: string;
    creator: string;
    expiresAt: string;
  };
}

export default function DareCard({ dare }: DareCardProps) {
  return (
    <Link href={`/d/${dare.id}`}>
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-cyan-400/40 transition overflow-hidden relative"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 transition" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/20">
              {dare.status}
            </span>

            <span className="text-zinc-500 text-sm">
              by {dare.creator}
            </span>
          </div>

          <h3 className="text-2xl font-bold mb-4 text-white">
            {dare.title}
          </h3>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Reward</p>
              <p className="text-3xl font-black text-cyan-400">
                ${dare.reward}
              </p>
            </div>

            <div className="text-right">
              <p className="text-zinc-400 text-sm">Expires</p>
              <p className="text-sm text-white">
                {dare.expiresAt}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
