"use client";

import dynamic from "next/dynamic";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";

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
