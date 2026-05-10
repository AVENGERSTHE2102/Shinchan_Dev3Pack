"use client";

import { useState } from "react";
import { useProof } from "../hooks/useProof";
import { useToast } from "./Toast";
import { useRouter } from "next/navigation";
import { Upload, Link as LinkIcon } from "lucide-react";
import { getRequiredPublicEnv } from "@/lib/env";

export default function ProofForm({ dareId }: { dareId: string }) {
  const [proofUrl, setProofUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { uploadProof, uploading } = useProof();
  const { success, error, loading: toastLoading, dismiss } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toastLoading("Submitting proof...", "Uploading your evidence");

    try {
      let finalUrl = proofUrl;

      if (file) {
        const path = await uploadProof(file);
        finalUrl = `${getRequiredPublicEnv("NEXT_PUBLIC_SUPABASE_URL")}/storage/v1/object/public/proofs/${path}`;
      }

      if (!finalUrl) throw new Error("Provide a URL or upload a file");

      const res = await fetch("/api/dare/prove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dare_id: dareId,
          proof_url: finalUrl,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit proof");
      }

      dismiss(tid);
      success("Proof submitted! 🎯", "The dare creator will review your submission.");
      setTimeout(() => router.push(`/d/${dareId}`), 1200);
    } catch (err: any) {
      dismiss(tid);
      error("Submission failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* File Upload */}
      <div>
        <label className="block text-zinc-400 mb-2 font-bold text-sm flex items-center gap-2">
          <Upload className="h-4 w-4" /> Upload File (Photo/Video)
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-sm
            file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0
            file:text-sm file:font-bold file:bg-cyan-500/10 file:text-cyan-400
            hover:file:bg-cyan-500/20 transition"
        />
        {file && (
          <p className="mt-2 text-xs text-cyan-400">✓ {file.name} selected</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-zinc-500 font-bold uppercase text-xs">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* URL Input */}
      <div>
        <label className="block text-zinc-400 mb-2 font-bold text-sm flex items-center gap-2">
          <LinkIcon className="h-4 w-4" /> Paste Link (YouTube, X, etc.)
        </label>
        <input
          type="url"
          placeholder="https://..."
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:border-cyan-500 focus:outline-none transition text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading || uploading || (!file && !proofUrl)}
        className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:scale-[1.02] active:scale-95 transition font-bold disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        {uploading ? "Uploading file..." : loading ? "Submitting..." : "🎯 Submit Proof"}
      </button>
    </form>
  );
}
