"use client";

import Image from "next/image";
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
    CASE_WORKER: "باحث حالة",
    DATA_ENTRY: "مدخل بيانات",
    EXECUTION_OFFICER: "مسؤول التنفيذ",
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:bg-surface-container-highest lg:hidden"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
          <div className="min-w-0 lg:hidden">
            <div className="truncate text-sm font-bold text-on-surface">لوحة التحكم</div>
            <div className="truncate text-[11px] text-on-surface-variant">
              {user ? (roleNames[user.role] || user.role) : "..."}
            </div>
          </div>
        </div>

        <div className="flex flex-row-reverse items-center justify-start gap-2 sm:gap-4">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:bg-surface-container-highest">
            <span className="material-symbols-outlined text-[20px]">
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-surface"></span>
          </button>
          
          <button className="flex items-center gap-3 pr-0 transition-opacity hover:opacity-80 sm:pr-4 sm:border-r sm:border-outline-variant/20">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-sm font-bold text-on-surface font-headline">
                {user ? user.name : "..."}
              </span>
              <span className="text-[10px] text-primary tracking-wide">
                {user ? (roleNames[user.role] || user.role) : "..."}
              </span>
            </div>
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGNatPgKmmKSxxoK-rAzIQjH3OeQIP-76aPv3Q_2Er6Sp7wOcUflIgH2lP3uLVaSUD4BzVSpwsrB3Ks5s0ZavfcvavDNA7BPPDhyVd6SW0sLPovulk9jyTcG9TUpA2CbECCWQAuzud9miVdRRafwjoS0W5i652xs33CD6bAMkbH_J9tCoIBauea95M3bx_O_UVEGmJqiFatrqWcp_g9KoQ1MinrVzf3TI1ilQB39lh0enyc6gETzWHM_wyqJzd5iGzg83RBpuNVNY"
              alt="Profile"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/10"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
