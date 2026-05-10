"use client";

import { Buffer } from "buffer";
import dynamic from "next/dynamic";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";

// Polyfill Buffer globally for Solana/Anchor compatibility
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}

const WalletProvider = dynamic(
  () => import("@/components/WalletProvider"),
  {
    ssr: false,
  }
);

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <WalletProvider>
        <Navbar />
        {children}
      </WalletProvider>
    </ToastProvider>
  );
}
