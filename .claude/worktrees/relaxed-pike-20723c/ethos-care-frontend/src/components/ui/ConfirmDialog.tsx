"use client";

import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_STYLES = {
  danger: {
    icon: "warning",
    iconBg: "bg-error/15 text-error",
    btn: "bg-error text-on-error hover:bg-error/90",
  },
  warning: {
    icon: "help",
    iconBg: "bg-warning/15 text-warning",
    btn: "bg-warning text-on-warning hover:bg-warning/90",
  },
  default: {
    icon: "help",
    iconBg: "bg-primary/15 text-primary",
    btn: "bg-primary text-on-primary hover:bg-primary/90",
  },
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const style = VARIANT_STYLES[variant];

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-slide-up">
        <div className="mb-4 flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${style.iconBg}`}>
            <span className="material-symbols-outlined text-2xl">{style.icon}</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface">{title}</h3>
        </div>

        <p className="mb-6 text-sm text-on-surface-variant leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm transition-all ${style.btn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
