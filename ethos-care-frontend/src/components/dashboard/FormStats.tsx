"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { isDirector } from "@/lib/roles";

interface Row {
  name: string;
  requested: number;
  approved: number;
  cost: number;
}

interface FormStatsResponse {
  generatedAt: string;
  casesCounted: number;
  supportItems: { category: string; items: Row[]; requested: number; approved: number; cost: number }[];
  caseTypes: Row[];
  classifications: Row[];
  degrees: Row[];
}

const fmt = (n: number) => n.toLocaleString("en-US");
const card = "rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5";

// جدول بنود: الاسم | مطلوب (مع شريط نسبي) | معتمد | التكلفة
function RowsTable({ rows, showCost }: { rows: Row[]; showCost?: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r.requested));
  return (
    <table className="mt-3 w-full text-sm">
      <thead>
        <tr className="text-xs text-on-surface-variant">
          <th className="pb-2 text-right font-bold">البند</th>
          <th className="pb-2 text-right font-bold">مطلوب</th>
          <th className="pb-2 text-right font-bold">معتمد</th>
          {showCost && <th className="pb-2 text-left font-bold">التكلفة</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/20">
        {rows.map((r) => (
          <tr key={r.name}>
            <td className="py-2 pe-2 font-bold text-on-surface">{r.name}</td>
            <td className="py-2 pe-2">
              <div className="flex items-center gap-2">
                <span className="w-8 tabular-nums">{fmt(r.requested)}</span>
                <span className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-high sm:block">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${(r.requested / max) * 100}%` }} />
                </span>
              </div>
            </td>
            <td className="py-2 pe-2 tabular-nums text-success">{fmt(r.approved)}</td>
            {showCost && (
              <td className="py-2 text-left tabular-nums text-on-surface-variant">
                {r.cost ? `${fmt(r.cost)} ج.م` : "—"}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function FormStats() {
  const { user } = useAuth();
  const allowed = isDirector(user?.role);
  const [data, setData] = useState<FormStatsResponse | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // ثقيلة نسبيًا (تقرأ كل الاستمارات): تُحمَّل مرة وبزر التحديث فقط، بدون تحديث دوري
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<FormStatsResponse>("/stats/form");
      setData(res.data);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (allowed) void load();
  }, [allowed, load]);

  if (!allowed) return null;

  return (
    <section className="space-y-4" aria-labelledby="form-stats-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="form-stats-heading" className="text-lg font-extrabold text-on-surface">
            أرقام الاستمارة
          </h2>
          <p className="text-xs text-on-surface-variant">
            {data
              ? `من ${fmt(data.casesCounted)} حالة (بدون المرفوضة) — «معتمد» = اعتمدها المدير`
              : "عدد كل بند مطلوب في الاستمارات"}
          </p>
        </div>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-surface-container-high px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container-highest disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`} aria-hidden="true">
            refresh
          </span>
          تحديث
        </button>
      </div>

      {error && !data ? (
        <div className={`${card} text-sm text-on-surface-variant`}>تعذّر تحميل أرقام الاستمارة.</div>
      ) : !data ? (
        <div className="grid gap-4 lg:grid-cols-2" aria-busy="true">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-3xl bg-surface-container-low" />
          ))}
        </div>
      ) : (
        <>
          {data.supportItems.length === 0 ? (
            <div className={`${card} text-sm text-on-surface-variant`}>لم تُطلب بنود دعم بعد.</div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {data.supportItems.map((group) => (
                <div key={group.category} className={card}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-on-surface">{group.category}</h3>
                    <span className="text-xs text-on-surface-variant">
                      مطلوب {fmt(group.requested)} · معتمد {fmt(group.approved)}
                      {group.cost ? ` · ${fmt(group.cost)} ج.م` : ""}
                    </span>
                  </div>
                  <RowsTable rows={group.items} showCost />
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className={card}>
              <h3 className="text-sm font-extrabold text-on-surface">أنواع الدعم / التدخل</h3>
              {data.caseTypes.length ? <RowsTable rows={data.caseTypes} /> : <p className="mt-3 text-sm text-on-surface-variant">لا توجد بيانات.</p>}
            </div>
            <div className={card}>
              <h3 className="text-sm font-extrabold text-on-surface">تصنيف الحالات</h3>
              {data.classifications.length ? <RowsTable rows={data.classifications} /> : <p className="mt-3 text-sm text-on-surface-variant">لم تُصنَّف حالات بعد.</p>}
              {data.degrees.length > 0 && (
                <>
                  <h4 className="mt-5 text-xs font-extrabold text-on-surface-variant">درجة التصنيف</h4>
                  <RowsTable rows={data.degrees} />
                </>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
