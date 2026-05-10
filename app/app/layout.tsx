import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

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
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}