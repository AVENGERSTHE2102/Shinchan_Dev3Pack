"use client";

import { useState } from "react";

export default function DareForm() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: "",
    recipient: "",
    expiry: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      await fetch("/api/dare/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      alert("Dare created successfully");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8"
    >
      <input
        type="text"
        placeholder="Dare title"
        className="w-full p-4 rounded-xl bg-black/40 border border-white/10"
        onChange={(e) =>
          setFormData({ ...formData, title: e.target.value })
        }
      />

      <textarea
        placeholder="Describe the challenge"
        className="w-full p-4 rounded-xl bg-black/40 border border-white/10"
        rows={5}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />

      <input
        type="number"
        placeholder="Reward in USDC"
        className="w-full p-4 rounded-xl bg-black/40 border border-white/10"
        onChange={(e) =>
          setFormData({ ...formData, reward: e.target.value })
        }
      />

      <input
        type="text"
        placeholder="Recipient wallet"
        className="w-full p-4 rounded-xl bg-black/40 border border-white/10"
        onChange={(e) =>
          setFormData({ ...formData, recipient: e.target.value })
        }
      />

      <input
        type="date"
        className="w-full p-4 rounded-xl bg-black/40 border border-white/10"
        onChange={(e) =>
          setFormData({ ...formData, expiry: e.target.value })
        }
      />

      <button
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition font-bold"
      >
        {loading ? "Creating..." : "Create Dare"}
      </button>
    </form>
  );
}
