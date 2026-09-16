'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div 
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border text-sm transition-all duration-200 ${
              toast.type === 'error'
                ? 'bg-[#B3261E] text-white border-red-800'
                : toast.type === 'warning'
                ? 'bg-[#E65100] text-white border-amber-800'
                : toast.type === 'success'
                ? 'bg-[#1B5E20] text-white border-green-800'
                : 'bg-[#1C1B1F] text-white border-gray-700'
            }`}
          >
            <span className="shrink-0 mt-0.5">
              {toast.type === 'error' || toast.type === 'warning' ? (
                <span aria-label="Warning alert">⚠️</span>
              ) : toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <Info className="w-5 h-5 text-white" />
              )}
            </span>
            <span className="flex-1 font-medium leading-snug">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 hover:opacity-80 rounded focus:outline-none focus:ring-2 focus:ring-white min-h-[30px] min-w-[30px] flex items-center justify-center"
              aria-label="Close alert"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
