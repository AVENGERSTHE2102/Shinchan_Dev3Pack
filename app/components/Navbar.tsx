"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const PhantomConnectButton = dynamic(
  () => import("./PhantomConnectButton"),
  { ssr: false }
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="relative z-[100] border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 transition-transform group-hover:scale-110">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">SolDare</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 lg:flex">
          <Link href="/#features" className="text-sm font-medium text-zinc-400 transition hover:text-white">
            Features
          </Link>
          <Link href="/#live-dares" className="text-sm font-medium text-zinc-400 transition hover:text-white">
            Browse
          </Link>
          
          <div className="h-6 w-px bg-white/10" />
          
          <PhantomConnectButton />
          
          <Link href="/create">
            <button className="rounded-2xl bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-zinc-200 active:scale-95">
              Create Dare
            </button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl border border-white/10 p-2 text-zinc-400 lg:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "absolute left-0 top-full w-full border-b border-white/5 bg-[#0a0a0a] px-6 py-8 transition-all lg:hidden",
        isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
      )}>
        <div className="flex flex-col gap-6">
          <Link 
            href="/#features" 
            onClick={() => setIsOpen(false)}
            className="text-lg font-bold text-zinc-400"
          >
            Features
          </Link>
          <Link 
            href="/#live-dares" 
            onClick={() => setIsOpen(false)}
            className="text-lg font-bold text-zinc-400"
          >
            Browse
          </Link>
          
          <div className="h-px w-full bg-white/5" />
          
          <div className="flex flex-col gap-4">
            <PhantomConnectButton />
            <Link href="/create" onClick={() => setIsOpen(false)}>
              <button className="w-full rounded-2xl bg-white py-4 font-bold text-black">
                Create Dare
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
