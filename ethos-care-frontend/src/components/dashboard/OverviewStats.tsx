"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

interface StatsResponse {
  cases: { total: number; pending: number };
  families: { total: number; eligible: number };
  operations: { total: number; totalBudget: number };
}

const fmt = (n: number) => n.toLocaleString("en-US");

export default function OverviewStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get("/stats")
      .then((res) => {
        if (active) {
          setStats(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // شريط إحصائي موحّد (لا كروت متطابقة عائمة ولا ألوان قوس قزح)
  const stripClass =
    "grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-outline-variant/30 bg-outline-variant/25 lg:grid-cols-4";

  if (loading) {
    return (
      <div className={stripClass} aria-busy="true" aria-label="جاري تحميل الإحصائيات">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[104px] animate-pulse bg-surface-container-low" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 text-sm font-medium text-on-surface-variant">
        تعذّر تحميل الإحصائيات الآن. حدّث الصفحة للمحاولة مرة أخرى.
      </div>
    );
  }

  const items = [
    {
      label: "إجمالي الحالات",
      value: fmt(stats.cases.total),
      sub: `${fmt(stats.cases.pending)} قيد المراجعة`,
      icon: "folder_shared",
    },
    {
      label: "الأسر المستفيدة",
      value: fmt(stats.families.total),
      sub: `${fmt(stats.families.eligible)} مستحق`,
      icon: "family_restroom",
    },
    {
      label: "العمليات الحالية",
      value: fmt(stats.operations.total),
      sub: "قوافل وعمليات",
      icon: "medical_services",
    },
    {
      label: "الميزانية المصروفة",
      value: `${fmt(stats.operations.totalBudget)} ج.م`,
      sub: "إجمالي الميزانيات",
      icon: "payments",
    },
  ];

  return (
    <div className={stripClass}>
      {items.map((it, i) => (
        <div
          key={it.label}
          className="flex items-start gap-3.5 bg-surface-container-lowest p-5 animate-stagger"
          style={{ "--stagger": i } as React.CSSProperties}
        >
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-primary">
            <span className="material-symbols-outlined" aria-hidden="true">
              {it.icon}
            </span>
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-on-surface-variant">{it.label}</p>
            <p className="mt-1 truncate text-2xl font-extrabold leading-none text-on-surface tabular-nums">
              {it.value}
            </p>
            <p className="mt-1.5 text-xs text-on-surface-variant">{it.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
