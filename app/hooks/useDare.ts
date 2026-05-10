import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useDare = (dareId: string) => {
  const [dare, setDare] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!dareId) return;
    const { data } = await supabase
      .from('dares')
      .select('*')
      .eq('id', dareId)
      .single();
    if (data) setDare(data);
    setLoading(false);
  }, [dareId]);

  useEffect(() => {
    if (!dareId) return;

    refresh();

    const subscription = supabase
      .channel(`dare:${dareId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dares', filter: `id=eq.${dareId}` }, (payload) => {
        console.log("Real-time update received:", payload.new);
        setDare(payload.new);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [dareId, refresh]);

  return { dare, loading, refresh };
};
