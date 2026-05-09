import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const useProof = () => {
  const [uploading, setUploading] = useState(false);

  const uploadProof = async (file: File) => {
    setUploading(true);
    try {
      const { data, error } = await supabase.storage
        .from('proofs')
        .upload(`${Date.now()}_${file.name}`, file);
      if (error) throw error;
      return data.path;
    } finally {
      setUploading(false);
    }
  };

  return { uploadProof, uploading };
};
