"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { X } from "lucide-react";

type ToastItem = {
  id: string;
  message: string;
  type?: "info" | "success" | "error";
};

type ToastState = {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => void;
  remove: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: crypto.randomUUID(), type: "info", ...toast },
      ],
    })),
  remove: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const ToastContainer = () => {
  const { toasts, remove } = useToastStore();

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => remove(toast.id), 3500)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-2 rounded-lg border px-3 py-2 shadow-lg ${
            toast.type === "error"
              ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100"
              : toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/50 dark:text-green-100"
              : "border-(--border) bg-(--card) text-(--foreground)"
          }`}
        >
          <span className="text-sm">{toast.message}</span>
          <button
            aria-label="Close"
            className="ml-auto text-xs text-(--muted) hover:text-(--foreground)"
            onClick={() => remove(toast.id)}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
