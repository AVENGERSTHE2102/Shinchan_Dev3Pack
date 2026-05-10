"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface Dare {
  id: string;
  creator_wallet: string;
  recipient_wallet: string;
  title: string;
  description: string;
  bounty_lamports: number;
  status: "created" | "accepted" | "paid" | "reclaimed";
  expires_at: string;
  created_at: string;
}

export function useDares() {
  const [dares, setDares] = useState<Dare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDares = async () => {
      const { data, error } = await supabase
        .from("dares")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setDares(data as Dare[]);
      setLoading(false);
    };

    fetchDares();

    // Real-time subscription
    const channel = supabase
      .channel("dares_feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dares" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setDares((current) => [payload.new as Dare, ...current]);
          } else if (payload.eventType === "UPDATE") {
            setDares((current) =>
              current.map((dare) =>
                dare.id === (payload.new as Dare).id ? (payload.new as Dare) : dare
              )
            );
          } else if (payload.eventType === "DELETE") {
            setDares((current) =>
              current.filter((dare) => dare.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { dares, loading };
}
