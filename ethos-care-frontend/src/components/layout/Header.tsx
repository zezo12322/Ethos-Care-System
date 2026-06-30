"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const roleNames: Record<string, string> = {
    ADMIN: "مدير النظام",
    CEO: "المدير التنفيذي",
    MANAGER: "مسؤول إدارة الحالة",
    CASE_WORKER: "باحث",
    EXECUTION_OFFICER: "مسؤول التنفيذ",
    CALL_CENTER: "خدمة المستفيدين",
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="فتح القائمة"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:bg-surface-container-highest lg:hidden"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">menu</span>
          </button>
          <div className="min-w-0 lg:hidden">
            <div className="truncate text-sm font-bold text-on-surface">لوحة التحكم</div>
            <div className="truncate text-[11px] text-on-surface-variant">
              {user ? (roleNames[user.role] || user.role) : "..."}
            </div>
          </div>
        </div>

        <div className="flex flex-row-reverse items-center justify-start gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="الإشعارات"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              notifications
            </span>
          </button>

          <div className="flex items-center gap-3 pr-0 sm:pr-4 sm:border-r sm:border-outline-variant/20">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-sm font-bold text-on-surface font-headline">
                {user ? user.name : "..."}
              </span>
              <span className="text-[10px] text-primary tracking-wide">
                {user ? (roleNames[user.role] || user.role) : "..."}
              </span>
            </div>
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold border-2 border-primary/10"
            >
              {user?.name?.trim()?.charAt(0) || "؟"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
