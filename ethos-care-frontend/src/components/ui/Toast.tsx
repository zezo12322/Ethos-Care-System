"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const VARIANT_STYLES: Record<
  ToastVariant,
  { bg: string; icon: string }
> = {
  success: { bg: "bg-success text-on-success", icon: "check_circle" },
  error: { bg: "bg-error text-on-error", icon: "error" },
  warning: { bg: "bg-warning text-on-warning", icon: "warning" },
  info: { bg: "bg-primary text-on-primary", icon: "info" },
};

const TOAST_DURATION = 4000;

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => {
          const style = VARIANT_STYLES[t.variant];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-bold shadow-xl animate-slide-up ${style.bg}`}
              role="alert"
            >
              <span className="material-symbols-outlined text-lg">{style.icon}</span>
              <span>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="mr-1 rounded-full p-0.5 opacity-70 hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
