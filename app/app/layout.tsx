import type { Metadata } from "next";
import dynamic from "next/dynamic";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";

const WalletProvider = dynamic(
  () => import("@/components/WalletProvider"),
  {
    ssr: false,
  }
);

export const metadata: Metadata = {
  title: "SolDare | Social Challenges on Solana",
  description: "Challenge your friends, lock SOL rewards, and automate payouts entirely on-chain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased selection:bg-cyan-500/30">
        <ToastProvider>
          <WalletProvider>
            <Navbar />
            {children}
          </WalletProvider>
        </ToastProvider>
      </body>
    </html>
  );
}