"use client";
import Link from "next/link";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();
  const userRole = user?.role || "CASE_WORKER"; // default 

  // Check if role is authorized
  const isAuthorized = (allowedRoles: string[]) => allowedRoles.includes(userRole);

  return (
    <aside className="fixed right-0 top-0 h-screen w-64 bg-primary z-50 flex flex-col p-4 overflow-y-auto font-headline antialiased text-right shadow-[0px_12px_32px_-4px_rgba(0,40,38,0.06)]">
      <div className="mb-10 flex flex-col items-center gap-2">
        <div className="w-full bg-white rounded-xl flex items-center justify-center py-3 px-2 mb-2 shadow-sm">
          <img src="/logo.png" alt="صناع الحياة بني سويف" className="h-10 w-auto object-contain" />
        </div>
        <p className="text-primary-200/60 text-xs mt-2">لوحة التحكم الإدارية</p>
      </div>
      <nav className="space-y-2">
        {isAuthorized(["ADMIN", "CEO", "CASE_WORKER", "DATA_ENTRY", "EXECUTION_OFFICER"]) && (
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 text-primary-200/70 hover:text-white transition-colors hover:bg-primary-800/30 rounded-lg"
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span>الرئيسية</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "MANAGER", "EXECUTION_OFFICER"]) && (
        <Link
          href="/dashboard/operations"
          className="flex items-center gap-3 px-4 py-3 text-primary-200/70 hover:text-white transition-colors hover:bg-primary-800/30 rounded-lg"
        >
          <span className="material-symbols-outlined">settings_accessibility</span>
          <span>العمليات</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "CASE_WORKER", "DATA_ENTRY", "CEO", "EXECUTION_OFFICER"]) && (
        <Link
          href="/dashboard/cases"
          className="flex items-center gap-3 px-4 py-3 text-primary-200/70 hover:text-white transition-colors hover:bg-primary-800/30 rounded-lg"
        >
          <span className="material-symbols-outlined">folder_shared</span>
          <span>الحالات</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "CASE_WORKER", "DATA_ENTRY", "EXECUTION_OFFICER"]) && (
        <Link
          href="/dashboard/families"
          className="flex items-center gap-3 px-4 py-3 text-primary-200/70 hover:text-white transition-colors hover:bg-primary-800/30 rounded-lg"
        >
          <span className="material-symbols-outlined">family_restroom</span>
          <span>الأسر</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "CEO", "CASE_WORKER", "DATA_ENTRY", "EXECUTION_OFFICER"]) && (
        <Link
          href="/dashboard/search"
          className="flex items-center gap-3 px-4 py-3 bg-primary-800/50 text-primary-100 rounded-lg font-bold scale-[0.98] transition-all duration-200"
        >
          <span className="material-symbols-outlined">search</span>
          <span>البحث</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "CEO", "MANAGER", "EXECUTION_OFFICER"]) && (
        <Link
          href="/dashboard/reports"
          className="flex items-center gap-3 px-4 py-3 text-primary-200/70 hover:text-white transition-colors hover:bg-primary-800/30 rounded-lg"
        >
          <span className="material-symbols-outlined">analytics</span>
          <span>التقارير</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "CEO"]) && (
        <Link
          href="/dashboard/partners"
          className="flex items-center gap-3 px-4 py-3 text-primary-200/70 hover:text-white transition-colors hover:bg-primary-800/30 rounded-lg"
        >
          <span className="material-symbols-outlined">handshake</span>
          <span>الشركاء</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "CEO"]) && (
        <Link
          href="/dashboard/news"
          className="flex items-center gap-3 px-4 py-3 text-primary-200/70 hover:text-white transition-colors hover:bg-primary-800/30 rounded-lg"
        >
          <span className="material-symbols-outlined">newspaper</span>
          <span>الأخبار</span>
        </Link>
        )}
        {isAuthorized(["ADMIN", "CEO", "CASE_WORKER", "EXECUTION_OFFICER"]) && (
        <Link
          href="/dashboard/locations"
          className="flex items-center gap-3 px-4 py-3 text-primary-200/70 hover:text-white transition-colors hover:bg-primary-800/30 rounded-lg"
        >
          <span className="material-symbols-outlined">location_on</span>
          <span>النطاق الجغرافي</span>
        </Link>
        )}
        <div className="pt-6 mt-6 border-t border-primary-800/50 space-y-2">
        {isAuthorized(["ADMIN"]) && (
          <Link
            href="/dashboard/admin"
            className="flex items-center gap-3 px-4 py-3 text-primary-200/70 hover:text-white transition-colors hover:bg-primary-800/30 rounded-lg"
          >
            <span className="material-symbols-outlined">admin_panel_settings</span>
            <span>الإدارة</span>
          </Link>
        )}
        </div>
      </nav>
            {/* Logout button */}
      <div className="mt-4 pt-4 border-t border-primary-800/50">
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
        <p className="text-primary-200/40 text-[10px] uppercase tracking-widest">
          Version 1.0.0
        </p>
      </div>
    </aside>
  );
}

