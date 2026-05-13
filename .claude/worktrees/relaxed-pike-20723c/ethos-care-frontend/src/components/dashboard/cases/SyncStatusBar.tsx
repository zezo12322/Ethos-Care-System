"use client";

import React from "react";
import type { SyncStatus } from "@/hooks/useOfflineDraft";

interface SyncStatusBarProps {
  syncStatus: SyncStatus;
  isOnline: boolean;
  lastSavedAt: number | null;
  pendingCount: number;
}

const STATUS_CONFIG: Record<
  SyncStatus,
  { icon: string; label: string; bg: string; text: string }
> = {
  idle: {
    icon: "edit_note",
    label: "جاهز للتحرير",
    bg: "bg-surface-container",
    text: "text-on-surface-variant",
  },
  saved_locally: {
    icon: "save",
    label: "محفوظ محلياً",
    bg: "bg-primary/10",
    text: "text-primary",
  },
  syncing: {
    icon: "sync",
    label: "جاري المزامنة...",
    bg: "bg-warning/15",
    text: "text-warning",
  },
  synced: {
    icon: "cloud_done",
    label: "تم المزامنة",
    bg: "bg-success/15",
    text: "text-success",
  },
  offline: {
    icon: "cloud_off",
    label: "بدون إنترنت — محفوظ محلياً",
    bg: "bg-error/10",
    text: "text-error",
  },
  error: {
    icon: "error",
    label: "فشل المزامنة — سيتم المحاولة لاحقاً",
    bg: "bg-error/15",
    text: "text-error",
  },
};

function formatTime(ts: number | null): string {
  if (!ts) return "";
  const date = new Date(ts);
  return date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SyncStatusBar({
  syncStatus,
  isOnline,
  lastSavedAt,
  pendingCount,
}: SyncStatusBarProps) {
  const effectiveStatus: SyncStatus = !isOnline && syncStatus !== "syncing" ? "offline" : syncStatus;
  const config = STATUS_CONFIG[effectiveStatus];

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold ${config.bg} ${config.text} transition-all duration-300`}
    >
      <span
        className={`material-symbols-outlined text-lg ${
          effectiveStatus === "syncing" ? "animate-spin" : ""
        }`}
      >
        {config.icon}
      </span>
      <span>{config.label}</span>

      {lastSavedAt ? (
        <span className="text-xs opacity-70">({formatTime(lastSavedAt)})</span>
      ) : null}

      {pendingCount > 0 ? (
        <span className="mr-auto rounded-full bg-error/20 px-2 py-0.5 text-xs text-error">
          {pendingCount} في الانتظار
        </span>
      ) : null}

      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isOnline ? "bg-success" : "bg-error"
        }`}
        title={isOnline ? "متصل" : "غير متصل"}
      />
    </div>
  );
}
