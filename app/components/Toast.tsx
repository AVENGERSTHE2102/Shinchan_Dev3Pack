"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  loading: (title: string, message?: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    
    if (type !== 'loading') {
      setTimeout(() => dismiss(id), 5000);
    }
    return id;
  }, [dismiss]);

  const success = (title: string, message?: string) => addToast('success', title, message);
  const error = (title: string, message?: string) => addToast('error', title, message);
  const info = (title: string, message?: string) => addToast('info', title, message);
  const loading = (title: string, message?: string) => addToast('loading', title, message);

  return (
    <ToastContext.Provider value={{ success, error, info, loading, dismiss }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]/80 p-4 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex gap-3">
                <div className="mt-0.5">
                  {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-green-400" />}
                  {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-400" />}
                  {toast.type === 'info' && <Info className="h-5 w-5 text-blue-400" />}
                  {toast.type === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">{toast.title}</h4>
                  {toast.message && <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{toast.message}</p>}
                </div>
                <button onClick={() => dismiss(toast.id)} className="text-zinc-500 hover:text-white transition">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {toast.type !== 'loading' && (
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className="absolute bottom-0 left-0 h-0.5 bg-white/10"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
