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
      <div className="mt-12 flex justify-center gap-4">
        <Link href="/dashboard/cases/new" className="px-6 py-3 bg-surface-container-highest font-bold rounded-xl hover:bg-surface-variant transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined">add</span>
          تسجيل حالة جديدة
        </Link>
        <Link href="/dashboard/families/new" className="px-6 py-3 bg-surface-container-highest font-bold rounded-xl hover:bg-surface-variant transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined">add</span>
          ملف أسرة جديد
        </Link>
      </div>
    </div>
  );
}
