import Link from "next/link";
import React from "react";

export default function Sidebar() {
  return (
    <aside className="fixed right-0 top-0 h-screen w-64 bg-emerald-900 z-50 flex flex-col p-4 overflow-y-auto font-headline antialiased text-right shadow-[0px_12px_32px_-4px_rgba(0,40,38,0.06)]">
      <div className="mb-10 flex flex-col items-center gap-2">
        <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-white text-4xl">
            settings_accessibility
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          صناع الحياة
        </h2>
        <p className="text-emerald-200/60 text-xs">لوحة التحكم الإدارية</p>
      </div>
      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 text-emerald-200/70 hover:text-white transition-colors hover:bg-emerald-800/30 rounded-lg"
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span>الرئيسية</span>
        </Link>
        <Link
          href="/dashboard/operations"
          className="flex items-center gap-3 px-4 py-3 text-emerald-200/70 hover:text-white transition-colors hover:bg-emerald-800/30 rounded-lg"
        >
          <span className="material-symbols-outlined">settings_accessibility</span>
          <span>العمليات</span>
        </Link>
        <Link
          href="/dashboard/cases"
          className="flex items-center gap-3 px-4 py-3 text-emerald-200/70 hover:text-white transition-colors hover:bg-emerald-800/30 rounded-lg"
        >
          <span className="material-symbols-outlined">folder_shared</span>
          <span>الحالات</span>
        </Link>
        <Link
          href="/dashboard/families"
          className="flex items-center gap-3 px-4 py-3 text-emerald-200/70 hover:text-white transition-colors hover:bg-emerald-800/30 rounded-lg"
        >
          <span className="material-symbols-outlined">family_restroom</span>
          <span>الأسر</span>
        </Link>
        <Link
          href="/dashboard/search"
          className="flex items-center gap-3 px-4 py-3 bg-emerald-800/50 text-emerald-100 rounded-lg font-bold scale-[0.98] transition-all duration-200"
        >
          <span className="material-symbols-outlined">search</span>
          <span>البحث</span>
        </Link>
        <Link
          href="/dashboard/reports"
          className="flex items-center gap-3 px-4 py-3 text-emerald-200/70 hover:text-white transition-colors hover:bg-emerald-800/30 rounded-lg"
        >
          <span className="material-symbols-outlined">analytics</span>
          <span>التقارير</span>
        </Link>
        <div className="pt-6 mt-6 border-t border-emerald-800/50 space-y-2">
          <Link
            href="/dashboard/admin"
            className="flex items-center gap-3 px-4 py-3 text-emerald-200/70 hover:text-white transition-colors hover:bg-emerald-800/30 rounded-lg"
          >
            <span className="material-symbols-outlined">admin_panel_settings</span>
            <span>الإدارة</span>
          </Link>
        </div>
      </nav>
      {/* Bottom version badge inside sidebar */}
      <div className="mt-auto pt-8 pb-4 text-center">
        <p className="text-emerald-200/40 text-[10px] uppercase tracking-widest">
          Version 1.0.0
        </p>
      </div>
    </aside>
  );
}
