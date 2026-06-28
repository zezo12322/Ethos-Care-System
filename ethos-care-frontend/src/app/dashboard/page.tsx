import Link from "next/link";
import OverviewStats from "@/components/dashboard/OverviewStats";
import ImmediateSearch from "@/components/dashboard/ImmediateSearch";
import DashboardGreeting from "@/components/dashboard/DashboardGreeting";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ترحيب + الإجراءات الأساسية (تسلسل واضح: زر أساسي واحد) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <DashboardGreeting />
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/cases/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-sm transition-colors hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              add
            </span>
            تسجيل حالة جديدة
          </Link>
          <Link
            href="/dashboard/families/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/50 bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              group_add
            </span>
            ملف أسرة جديد
          </Link>
        </div>
      </div>

      <OverviewStats />
      <ImmediateSearch />
    </div>
  );
}
