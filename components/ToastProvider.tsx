"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastContextValue = {
  mostrarToast: (mensagem: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return ctx.mostrarToast;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [mensagem, setMensagem] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrarToast = useCallback((texto: string) => {
    setMensagem(texto);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMensagem(""), 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      {mensagem && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-20 md:bottom-6 btn-accent text-xs font-medium px-4 py-2.5 rounded-full shadow-lg z-50 max-w-[90vw] text-center">
          {mensagem}
        </div>
      )}
    </ToastContext.Provider>
  );
}
