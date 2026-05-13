import Link from "next/link";
import OverviewStats from "@/components/dashboard/OverviewStats";
import ImmediateSearch from "@/components/dashboard/ImmediateSearch";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Overview Statistics */}
      <OverviewStats />

      {/* Immediate Search Section (Client Component) */}
      <ImmediateSearch />

      {/* Quick Action Buttons */}
      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/dashboard/cases/new" className="flex items-center justify-center gap-2 rounded-xl bg-surface-container-highest px-6 py-3 text-center font-bold transition-colors hover:bg-surface-variant">
          <span className="material-symbols-outlined">add</span>
          تسجيل حالة جديدة
        </Link>
        <Link href="/dashboard/families/new" className="flex items-center justify-center gap-2 rounded-xl bg-surface-container-highest px-6 py-3 text-center font-bold transition-colors hover:bg-surface-variant">
          <span className="material-symbols-outlined">add</span>
          ملف أسرة جديد
        </Link>
      </div>
    </div>
  );
}
