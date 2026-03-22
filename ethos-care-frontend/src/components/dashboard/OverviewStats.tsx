"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';

interface StatsResponse {
  cases: { total: number; pending: number; };
  families: { total: number; eligible: number; };
  operations: { total: number; totalBudget: number; };
}

export default function OverviewStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats').then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 animate-pulse">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-surface-container-high rounded-3xl"></div>)}
    </div>;
  }

  if (!stats) return null;

  const statCards = [
    { title: "إجمالي الحالات", value: stats.cases.total, sub: `${stats.cases.pending} قيد المراجعة`, icon: "folder_shared", color: "text-blue-600", bg: "bg-blue-100" },
    { title: "الأسر المستفيدة", value: stats.families.total, sub: `${stats.families.eligible} مستحق`, icon: "family_restroom", color: "text-green-600", bg: "bg-green-100" },
    { title: "العمليات الحالية", value: stats.operations.total, sub: "عمليات وقوافل", icon: "medical_services", color: "text-purple-600", bg: "bg-purple-100" },
    { title: "الميزانية المصروفة", value: `${stats.operations.totalBudget.toLocaleString()} ج.م`, sub: "إجمالي الميزانيات", icon: "payments", color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {statCards.map((card, i) => (
        <div key={i} className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
            <span className="material-symbols-outlined text-3xl">{card.icon}</span>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant font-bold mb-1">{card.title}</p>
            <h3 className="text-2xl font-extrabold font-headline text-on-surface leading-none">{card.value}</h3>
            <p className="text-xs text-on-surface-variant mt-1">{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
