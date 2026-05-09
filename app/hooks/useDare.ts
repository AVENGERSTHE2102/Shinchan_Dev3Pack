import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useDare = (dareId: string) => {
  const [dare, setDare] = useState<any>(null);

  useEffect(() => {
    if (!dareId) return;

    const fetchDare = async () => {
      const { data } = await supabase
        .from('dares')
        .select('*')
        .eq('id', dareId)
        .single();
      setDare(data);
    };

    fetchDare();

    const subscription = supabase
      .channel(`dare:${dareId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dares', filter: `id=eq.${dareId}` }, (payload) => {
        setDare(payload.new);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [dareId]);

  return { dare };
};
