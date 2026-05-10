"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { LogOut, Wallet, Copy, CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PhantomConnectButton() {
  const { setVisible } = useWalletModal();
  const { publicKey, disconnect, connected } = useWallet();
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const base58 = publicKey?.toBase58();
  const content = base58
    ? `${base58.slice(0, 4)}...${base58.slice(-4)}`
    : "Connect Wallet";

  const handleCopy = () => {
    if (base58) {
      navigator.clipboard.writeText(base58);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!connected) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-3 font-bold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98]"
      >
        <Wallet className="h-4 w-4 transition-transform group-hover:rotate-12" />
        <span>Connect Wallet</span>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
      >
        <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
        <span className="font-mono text-sm">{content}</span>
        <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition-transform", showMenu && "rotate-180")} />
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)} 
          />
          <div className="absolute right-0 mt-2 z-50 w-48 origin-top-right rounded-2xl border border-white/10 bg-[#0a0a0a] p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-200">
            <button
              onClick={handleCopy}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy Address"}
            </button>
            <div className="my-1 h-px bg-white/5" />
            <button
              onClick={() => {
                disconnect();
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}
