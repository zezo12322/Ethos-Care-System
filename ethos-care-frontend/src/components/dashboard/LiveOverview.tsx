"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ago, historyText, priorityOf, PRIORITY_ROW } from "@/lib/caseLabels";

const MANAGER_ROLES = ["ADMIN", "CEO"];
const REFRESH_MS = 30_000;

interface LiveStats {
  generatedAt: string;
  staleDays: number;
  today: { cases: number; actions: number; families: number };
  cases: {
    byLifecycle: Record<string, number>;
    openByPriority: Record<string, number>;
    stale: number;
  };
  workload: { userId: string | null; name: string; open: number }[];
  recentActivity: {
    id: string;
    action: string;
    toLifecycleStatus: string;
    performedAt: string;
    case: { id: string; applicantName: string } | null;
    performedBy: { name: string } | null;
  }[];
  trend: { date: string; count: number }[];
  awaitingDecision: {
    id: string;
    applicantName: string;
    caseType: string;
    priority: string;
    familyId: string | null;
    lastActionAt: string;
    opinion: string | null;
  }[];
}

const PIPELINE = [
  { key: "DRAFT", label: "مع الباحث", tone: "bg-outline" },
  { key: "REVIEW", label: "بانتظار قرار المدير", tone: "bg-warning" },
  { key: "APPROVED", label: "معتمدة", tone: "bg-primary" },
  { key: "EXECUTION", label: "تنفيذ", tone: "bg-secondary" },
  { key: "COMPLETED", label: "مكتمل", tone: "bg-success" },
  { key: "REJECTED", label: "مرفوضة", tone: "bg-error" },
];

const fmt = (n: number) => n.toLocaleString("en-US");

const card = "rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-5";
const title = "flex items-center gap-2 text-sm font-extrabold text-on-surface";

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined text-[20px] ${className}`} aria-hidden="true">
      {name}
    </span>
  );
}

export default function LiveOverview() {
  const { user } = useAuth();
  const allowed = !!user && MANAGER_ROLES.includes(user.role);
  const [data, setData] = useState<LiveStats | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.get<LiveStats>("/stats/live");
      setData(res.data);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    load();
    // يتحدّث تلقائيًا كل 30 ثانية طالما التبويب ظاهر، وفورًا عند الرجوع له
    const poll = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, REFRESH_MS);
    const tick = setInterval(() => setNow(Date.now()), 5_000);
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(poll);
      clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [allowed, load]);

  if (!allowed) return null;

  if (!data) {
    return error ? (
      <div className={`${card} text-sm font-medium text-on-surface-variant`}>
        تعذّر تحميل لوحة المتابعة اللحظية.{" "}
        <button onClick={load} className="font-bold text-primary underline">
          حاول مرة أخرى
        </button>
      </div>
    ) : (
      <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="جاري تحميل لوحة المتابعة">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-3xl bg-surface-container-low" />
        ))}
      </div>
    );
  }

  const urgent = data.cases.openByPriority.URGENT ?? 0;
  const high = data.cases.openByPriority.HIGH ?? 0;
  const pipelineTotal = PIPELINE.reduce((s, p) => s + (data.cases.byLifecycle[p.key] ?? 0), 0);
  const maxLoad = Math.max(1, ...data.workload.map((w) => w.open));
  const maxTrend = Math.max(1, ...data.trend.map((t) => t.count));
  const trendTotal = data.trend.reduce((s, t) => s + t.count, 0);

  const todayItems = [
    { label: "حالات جديدة اليوم", value: data.today.cases, icon: "note_add" },
    { label: "إجراءات تمت اليوم", value: data.today.actions, icon: "task_alt" },
    { label: "أسر جديدة اليوم", value: data.today.families, icon: "family_restroom" },
  ];

  const alerts = [
    { label: "حالات عاجلة مفتوحة", value: urgent, icon: "emergency", hot: urgent > 0, filter: "priority=URGENT" },
    { label: "أولوية عالية مفتوحة", value: high, icon: "priority_high", hot: false, filter: "priority=HIGH" },
    {
      label: `حالات متوقفة +${data.staleDays} أيام`,
      value: data.cases.stale,
      icon: "hourglass_bottom",
      hot: data.cases.stale > 0,
      filter: "stale=1",
    },
  ];

  return (
    <section className="space-y-4" aria-labelledby="live-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="live-heading" className="flex items-center gap-2 text-lg font-extrabold text-on-surface">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          الوضع الآن
        </h2>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          {error && <span className="font-bold text-error">فشل آخر تحديث —</span>}
          <span aria-live="polite">آخر تحديث {ago(data.generatedAt, now)}</span>
          <button
            onClick={load}
            disabled={refreshing}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-container-high disabled:opacity-50"
            aria-label="تحديث الآن"
          >
            <Icon name="refresh" className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* بانتظار قرار المدير: رفعها الباحث بموافقة أو رفض — اللون بحسب الأولوية */}
      <div className={card}>
        <h3 className={title}>
          <Icon name="gavel" className="text-primary" />
          بانتظار قرارك
          <span className="text-xs font-medium text-on-surface-variant">({fmt(data.awaitingDecision.length)})</span>
        </h3>
        {data.awaitingDecision.length === 0 ? (
          <p className="mt-3 text-sm text-on-surface-variant">لا توجد حالات بانتظار قرارك.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {data.awaitingDecision.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/dashboard/cases/${c.id}`}
                  className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border px-4 py-3 text-sm transition-opacity hover:opacity-80 ${PRIORITY_ROW[c.priority] ?? PRIORITY_ROW.NORMAL}`}
                >
                  <span className="font-bold text-on-surface">{c.applicantName}</span>
                  <span className="text-on-surface-variant">{c.caseType}</span>
                  <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-xs font-bold text-on-surface">
                    رأي الباحث: {c.opinion ?? "—"}
                  </span>
                  {c.priority !== "NORMAL" && (
                    <span className="text-xs font-bold text-on-surface">{priorityOf(c.priority).label}</span>
                  )}
                  <span className="ms-auto text-xs text-on-surface-variant">{ago(c.lastActionAt, now)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* اليوم */}
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-3xl border border-outline-variant/30 bg-outline-variant/25">
        {todayItems.map((it) => (
          <div key={it.label} className="flex items-center gap-3 bg-surface-container-lowest p-4">
            <Icon name={it.icon} className="text-primary" />
            <div>
              <p className="text-xl font-extrabold leading-none tabular-nums text-on-surface">{fmt(it.value)}</p>
              <p className="mt-1 text-xs text-on-surface-variant">{it.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* تنبيهات تحتاج تدخل */}
      <div className="grid gap-3 sm:grid-cols-3">
        {alerts.map((a) => (
          <Link
            key={a.label}
            href={`/dashboard/families?${a.filter}`}
            className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors ${
              a.hot
                ? "border-error/30 bg-error-container text-on-error-container hover:bg-error-container/80"
                : "border-outline-variant/30 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <Icon name={a.icon} />
            <span className="flex-1 text-sm font-bold">{a.label}</span>
            <span className="text-2xl font-extrabold tabular-nums">{fmt(a.value)}</span>
          </Link>
        ))}
      </div>

      {/* مسار الحالات */}
      <div className={card}>
        <h3 className={title}>
          <Icon name="account_tree" className="text-primary" />
          مسار الحالات
          <span className="text-xs font-medium text-on-surface-variant">({fmt(pipelineTotal)} حالة)</span>
        </h3>
        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-surface-container-high" role="img" aria-label="توزيع الحالات على المراحل">
          {PIPELINE.map((p) => {
            const n = data.cases.byLifecycle[p.key] ?? 0;
            return n ? <div key={p.key} className={p.tone} style={{ width: `${(n / Math.max(1, pipelineTotal)) * 100}%` }} /> : null;
          })}
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {PIPELINE.map((p) => (
            <div key={p.key}>
              <dt className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className={`h-2 w-2 rounded-full ${p.tone}`} />
                {p.label}
              </dt>
              <dd className="mt-1 text-lg font-extrabold tabular-nums text-on-surface">
                {fmt(data.cases.byLifecycle[p.key] ?? 0)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* توزيع العمل على الفريق */}
        <div className={card}>
          <h3 className={title}>
            <Icon name="groups" className="text-primary" />
            الحالات المفتوحة لكل موظف
          </h3>
          {data.workload.length === 0 ? (
            <p className="mt-4 text-sm text-on-surface-variant">لا توجد حالات مفتوحة.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.workload.slice(0, 8).map((w) => (
                <li key={w.userId ?? "none"} className="flex items-center gap-3 text-sm">
                  <span className={`w-32 truncate ${w.userId ? "text-on-surface" : "font-bold text-error"}`}>{w.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                    <div
                      className={`h-full rounded-full ${w.userId ? "bg-secondary" : "bg-error"}`}
                      style={{ width: `${(w.open / maxLoad) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-left font-bold tabular-nums">{fmt(w.open)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* اتجاه آخر 14 يوم */}
        <div className={`${card} lg:col-span-2 lg:order-last`}>
          <h3 className={title}>
            <Icon name="bar_chart" className="text-primary" />
            الحالات الجديدة — آخر 14 يوم
            <span className="text-xs font-medium text-on-surface-variant">({fmt(trendTotal)})</span>
          </h3>
          <div className="mt-4 flex h-32 items-end gap-1" role="img" aria-label={`إجمالي ${trendTotal} حالة في آخر 14 يوم`}>
            {data.trend.map((t, i) => (
              <div key={t.date} className="group relative flex h-full flex-1 flex-col justify-end">
                <div
                  className={`rounded-t ${i === data.trend.length - 1 ? "bg-primary" : "bg-primary/40"} group-hover:bg-primary`}
                  style={{ height: `${Math.max(2, (t.count / maxTrend) * 100)}%` }}
                  title={`${t.date}: ${t.count}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-on-surface-variant">
            <span>{data.trend[0]?.date.slice(5)}</span>
            <span>اليوم</span>
          </div>
        </div>

        {/* آخر الحركات */}
        <div className={card}>
          <h3 className={title}>
            <Icon name="history" className="text-primary" />
            آخر الحركات
          </h3>
          {data.recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-on-surface-variant">لا توجد حركات بعد.</p>
          ) : (
            <ul className="mt-3 max-h-64 divide-y divide-outline-variant/20 overflow-y-auto">
              {data.recentActivity.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <p className="min-w-0 text-on-surface">
                    <span className="font-bold">{a.performedBy?.name ?? "النظام"}</span> {historyText(a)}
                    {a.case && (
                      <>
                        {" — "}
                        <Link href={`/dashboard/cases/${a.case.id}`} className="font-bold text-primary hover:underline">
                          {a.case.applicantName}
                        </Link>
                      </>
                    )}
                  </p>
                  <span className="shrink-0 text-xs text-on-surface-variant">{ago(a.performedAt, now)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
