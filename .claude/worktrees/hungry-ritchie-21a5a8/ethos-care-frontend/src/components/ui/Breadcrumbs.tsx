"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "لوحة التحكم",
  cases: "الحالات",
  families: "الأسر",
  operations: "العمليات",
  locations: "المواقع",
  reports: "التقارير",
  news: "الأخبار",
  partners: "الشركاء",
  search: "البحث",
  admin: "الإدارة",
  new: "إضافة",
  edit: "تعديل",
  print: "طباعة",
};

function formatSegment(segment: string): string {
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment];
  // UUID-like segments — show first 8 chars
  if (segment.length > 12) return segment.slice(0, 8).toUpperCase();
  return segment;
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, idx) => ({
    label: formatSegment(seg),
    href: "/" + segments.slice(0, idx + 1).join("/"),
    isLast: idx === segments.length - 1,
  }));

  return (
    <nav aria-label="breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-on-surface-variant">
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {crumb.isLast ? (
            <span className="font-bold text-on-surface">{crumb.label}</span>
          ) : (
            <>
              <Link href={crumb.href} className="hover:text-primary transition-colors">
                {crumb.label}
              </Link>
              <span className="material-symbols-outlined text-sm rtl:rotate-180">chevron_right</span>
            </>
          )}
        </span>
      ))}
    </nav>
  );
}
