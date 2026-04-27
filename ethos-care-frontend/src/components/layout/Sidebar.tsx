"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  mobileOpen = false,
  onClose,
}: SidebarProps) {
  const { user } = useAuth();
  const userRole = user?.role || "CASE_WORKER";

  // Check if role is authorized
  const isAuthorized = (allowedRoles: string[]) => allowedRoles.includes(userRole);

  return (
    <>
      <button
        type="button"
        aria-label="إغلاق القائمة"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity lg:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-[88vw] max-w-xs flex-col overflow-y-auto bg-primary p-4 text-right font-headline antialiased shadow-[0px_12px_32px_-4px_rgba(0,40,38,0.06)] transition-transform duration-300 lg:w-64 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        } lg:translate-x-0`}
      >
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <span className="text-sm font-bold text-white/80">القائمة</span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="mb-2 flex items-center justify-center">
          <Image src="/logo.png" alt="شعار صناع الحياة" width={80} height={80} className="w-20 h-20 object-contain brightness-0 invert" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          صناع الحياة
        </h2>
        <p className="text-white/60 text-xs">لوحة التحكم الإدارية</p>
      </div>
      <nav className="space-y-2">
        {isAuthorized(["ADMIN", "CEO", "MANAGER", "CASE_WORKER", "DATA_ENTRY", "EXECUTION_OFFICER", "CALL_CENTER"]) && (
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-lg"
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span>الرئيسية</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "MANAGER", "EXECUTION_OFFICER", "CEO", "CASE_WORKER", "DATA_ENTRY"]) && (
        <Link
          href="/dashboard/operations"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-lg"
        >
          <span className="material-symbols-outlined">settings_accessibility</span>
          <span>العمليات</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "CEO", "MANAGER", "CASE_WORKER", "DATA_ENTRY", "EXECUTION_OFFICER", "CALL_CENTER"]) && (
        <Link
          href="/dashboard/cases"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-lg"
        >
          <span className="material-symbols-outlined">folder_shared</span>
          <span>الحالات</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "CEO", "MANAGER", "CASE_WORKER", "DATA_ENTRY", "EXECUTION_OFFICER", "CALL_CENTER"]) && (
        <Link
          href="/dashboard/families"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-lg"
        >
          <span className="material-symbols-outlined">family_restroom</span>
          <span>الأسر</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "CEO", "MANAGER", "CASE_WORKER", "DATA_ENTRY", "EXECUTION_OFFICER", "CALL_CENTER"]) && (
        <Link
          href="/dashboard/search"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-lg"
        >
          <span className="material-symbols-outlined">search</span>
          <span>البحث</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "CEO", "MANAGER", "EXECUTION_OFFICER"]) && (
        <Link
          href="/dashboard/reports"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-lg"
        >
          <span className="material-symbols-outlined">table_view</span>
          <span>الاستخراجات</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "CEO"]) && (
        <Link
          href="/dashboard/partners"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-lg"
        >
          <span className="material-symbols-outlined">handshake</span>
          <span>الشركاء</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "CEO"]) && (
        <Link
          href="/dashboard/news"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-lg"
        >
          <span className="material-symbols-outlined">newspaper</span>
          <span>الأخبار</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "CEO", "MANAGER", "CASE_WORKER", "EXECUTION_OFFICER"]) && (
        <Link
          href="/dashboard/locations"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-lg"
        >
          <span className="material-symbols-outlined">location_on</span>
          <span>النطاق الجغرافي</span>
        </Link>
        )}
        <div className="pt-6 mt-6 border-t border-white/10 space-y-2">
        {isAuthorized(["ADMIN", "CEO"]) && (
          <Link
            href="/dashboard/admin"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-lg"
          >
            <span className="material-symbols-outlined">admin_panel_settings</span>
            <span>{userRole === "CEO" ? "الإدارة التنفيذية" : "الإدارة"}</span>
          </Link>
        )}
        </div>
      </nav>
            {/* Logout button */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <button
          onClick={() => {
            import("js-cookie").then((Cookies) => {
              Cookies.default.remove("access_token");
              window.location.href = "/login";
            });
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors hover:bg-red-900/20 rounded-lg"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>تسجيل خروج</span>
        </button>
      </div>
      {/* Bottom version badge inside sidebar */}
      <div className="mt-auto pt-8 pb-4 text-center">
        <p className="text-white/40 text-[10px] uppercase tracking-widest">
          Version 1.0.0
        </p>
      </div>
      </aside>
    </>
  );
}
