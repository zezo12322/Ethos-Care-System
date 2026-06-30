"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { casesService } from "@/services/cases.service";
import { useAuth } from "@/contexts/AuthContext";
import { CaseRecord } from "@/types/api";
import SortableTh from "@/components/ui/SortableTh";
import {
  useTableSort,
  compareText,
  compareDate,
  compareByRank,
  type SortComparator,
} from "@/hooks/useTableSort";

const PRIORITY_RANK: Record<string, number> = {
  URGENT: 3,
  HIGH: 2,
  NORMAL: 1,
};

const LIFECYCLE_RANK: Record<string, number> = {
  DRAFT: 0,
  REVIEW: 1,
  FIELD_VERIFICATION: 2,
  APPROVED: 3,
  EXECUTION: 4,
  COMPLETED: 5,
};

const CASE_SORT_COMPARATORS: Record<string, SortComparator<CaseRecord>> = {
  name: (a, b) => compareText(a.applicantName, b.applicantName),
  caseType: (a, b) => compareText(a.caseType, b.caseType),
  priority: (a, b) => compareByRank(PRIORITY_RANK, a.priority, b.priority),
  createdAt: (a, b) => compareDate(a.createdAt, b.createdAt),
  location: (a, b) => compareText(a.location, b.location),
  status: (a, b) =>
    compareByRank(LIFECYCLE_RANK, a.lifecycleStatus, b.lifecycleStatus),
};

const CASE_TYPE_FILTERS = [
  "مساعدة مالية",
  "دعم منزلي",
  "سقف",
  "دعم طبي",
  "منح دراسية",
  "تمكين اقتصادي",
  "مواد غذائية",
  "مرافق وخدمات",
  "تجهيز عرائس",
];

const lifecycleMap: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "مسودة", color: "bg-surface-container text-on-surface-variant" },
  REVIEW: { label: "مراجعة", color: "bg-warning/15 text-warning" },
  FIELD_VERIFICATION: { label: "تحقق ميداني", color: "bg-warning/15 text-warning" },
  APPROVED: { label: "موافقة", color: "bg-success/15 text-success" },
  EXECUTION: { label: "تنفيذ", color: "bg-primary/15 text-primary" },
  COMPLETED: { label: "مكتمل", color: "bg-success text-on-success" },
  // Legacy
  INTAKE_REVIEW: { label: "مراجعة (قديم)", color: "bg-warning/15 text-warning" },
  COMMITTEE_REVIEW: { label: "لجنة (قديم)", color: "bg-warning/15 text-warning" },
  IN_PROGRESS: { label: "تنفيذ (قديم)", color: "bg-primary/15 text-primary" },
  REJECTED: { label: "مرفوض (قديم)", color: "bg-error/15 text-error" },
  ON_HOLD: { label: "معلق (قديم)", color: "bg-surface-variant text-on-surface-variant" },
  ARCHIVED: { label: "مؤرشف (قديم)", color: "bg-surface-container text-on-surface-variant" },
};

const priorityMap: Record<"URGENT" | "HIGH" | "NORMAL", { label: string; color: string }> = {
  URGENT: { label: "عاجل", color: "text-error" },
  HIGH: { label: "عالي", color: "text-warning" },
  NORMAL: { label: "عادي", color: "text-on-surface-variant" },
};

export default function CasesPage() {
  const { user } = useAuth();
  // الكول سنتر: عرض فقط — لا إنشاء/تعديل/حذف
  const canManage = (user?.role ?? "") !== "CALL_CENTER";
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("الكل");
  const [filterStatus, setFilterStatus] = useState("الكل");
  const [search, setSearch] = useState("");

  const fetchCases = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const data = await casesService.getAll();
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCases(false);
  }, []);

  const handleExport = () => {
    const headers = "رقم الحالة,الاسم,النوع,الحالة,الأولوية,التاريخ,المكان\n";
    const csv = cases
      .map(
        (c) =>
          `${c.id},${c.applicantName},${c.caseType},${c.lifecycleStatus},${c.priority},${new Date(c.createdAt).toLocaleDateString("ar-EG")},${c.location}`,
      )
      .join("\n");
    const blob = new Blob(["﻿" + headers + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `cases_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف حالة "${name}"؟`)) {
      try {
        await casesService.remove(id);
        await fetchCases();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const hasActiveFilters =
    filterType !== "الكل" || filterStatus !== "الكل" || search.trim() !== "";

  const clearFilters = () => {
    setFilterType("الكل");
    setFilterStatus("الكل");
    setSearch("");
  };

  const filteredCases = cases.filter((c) => {
    if (filterType !== "الكل" && !(c.caseType || "").includes(filterType)) return false;
    if (filterStatus !== "الكل" && c.lifecycleStatus !== filterStatus) return false;
    if (search && !c.applicantName.includes(search) && !c.id.includes(search)) return false;
    return true;
  });

  const { sorted: sortedCases, sort, toggleSort } = useTableSort(
    filteredCases,
    CASE_SORT_COMPARATORS,
  );

  const selectClass =
    "rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

  return (
    <div className="space-y-6">
      {/* العنوان + الإجراءات */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="border-r-4 border-secondary pr-4">
          <h1 className="text-3xl font-bold font-headline text-on-surface">
            إدارة الحالات والطلبات
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            متابعة وتحديث حالات المستفيدين والتدخلات المطلوبة.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={cases.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              download
            </span>
            تصدير البيانات
          </button>
          {canManage && (
            <Link
              href="/dashboard/cases/new"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-sm transition-colors hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                add
              </span>
              تسجيل طلب جديد
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
        {/* أدوات الفلترة */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/30 bg-surface-container-lowest/60 p-4">
          <div className="flex w-full items-center gap-2 rounded-xl border border-outline-variant/50 bg-white px-3 py-2 transition-colors focus-within:border-primary md:w-80">
            <span className="material-symbols-outlined text-outline" aria-hidden="true">
              search
            </span>
            <label htmlFor="cases-search" className="sr-only">
              بحث بالاسم أو رقم الحالة
            </label>
            <input
              id="cases-search"
              type="text"
              placeholder="بحث بالاسم أو رقم الحالة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-outline"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="filter-type" className="sr-only">
              نوع التدخل
            </label>
            <select
              id="filter-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={selectClass}
            >
              <option value="الكل">جميع أنواع التدخل</option>
              {CASE_TYPE_FILTERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <label htmlFor="filter-status" className="sr-only">
              حالة الطلب
            </label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={selectClass}
            >
              <option value="الكل">جميع الحالات</option>
              <option value="DRAFT">مسودة</option>
              <option value="REVIEW">مراجعة</option>
              <option value="FIELD_VERIFICATION">تحقق ميداني</option>
              <option value="APPROVED">موافقة</option>
              <option value="EXECUTION">تنفيذ</option>
              <option value="COMPLETED">مكتمل</option>
            </select>
          </div>
        </div>

        {/* عدّاد النتائج */}
        {!loading && (
          <div className="flex items-center justify-between gap-3 px-6 py-3 text-xs font-bold text-on-surface-variant">
            <span>
              {hasActiveFilters
                ? `${filteredCases.length.toLocaleString("en-US")} نتيجة من ${cases.length.toLocaleString("en-US")}`
                : `${cases.length.toLocaleString("en-US")} حالة`}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-primary transition-colors hover:bg-primary/10"
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  close
                </span>
                مسح الفلاتر
              </button>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right">
            <thead className="border-b border-outline-variant/30 bg-surface-container-lowest text-sm text-on-surface-variant">
              <tr>
                <SortableTh
                  sortKey="name"
                  activeKey={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                >
                  رقم الحالة / المستفيد
                </SortableTh>
                <SortableTh
                  sortKey="caseType"
                  activeKey={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                  className="hidden sm:table-cell"
                >
                  نوع التدخل
                </SortableTh>
                <SortableTh
                  sortKey="priority"
                  activeKey={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                  className="hidden lg:table-cell"
                >
                  الأولوية
                </SortableTh>
                <SortableTh
                  sortKey="createdAt"
                  activeKey={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                  className="hidden lg:table-cell"
                >
                  تاريخ التسجيل
                </SortableTh>
                <SortableTh
                  sortKey="location"
                  activeKey={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                  className="hidden xl:table-cell"
                >
                  المكان
                </SortableTh>
                <SortableTh
                  sortKey="status"
                  activeKey={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                >
                  الحالة
                </SortableTh>
                <th scope="col" className="px-6 py-4 text-center font-bold">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm font-medium">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-3">
                      <div className="h-10 animate-pulse rounded-xl bg-surface-container-low" />
                    </td>
                  </tr>
                ))
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <span
                      className="material-symbols-outlined mb-3 text-5xl text-outline"
                      aria-hidden="true"
                    >
                      {cases.length === 0 ? "folder_open" : "search_off"}
                    </span>
                    {cases.length === 0 ? (
                      <>
                        <p className="mb-1 text-base font-bold text-on-surface">
                          لا توجد حالات مسجّلة بعد
                        </p>
                        <p className="mb-5 text-sm text-on-surface-variant">
                          ابدأ بتسجيل أول حالة دعم لمتابعتها هنا.
                        </p>
                        {canManage && (
                          <Link
                            href="/dashboard/cases/new"
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-colors hover:bg-primary/90"
                          >
                            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                              add
                            </span>
                            تسجيل أول حالة
                          </Link>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="mb-1 text-base font-bold text-on-surface">
                          لا توجد نتائج مطابقة
                        </p>
                        <p className="mb-5 text-sm text-on-surface-variant">
                          جرّب تعديل البحث أو الفلاتر.
                        </p>
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high px-5 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
                        >
                          مسح الفلاتر
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                sortedCases.map((c) => {
                  const priority =
                    priorityMap[(c.priority as "URGENT" | "HIGH" | "NORMAL") || "NORMAL"] ||
                    priorityMap.NORMAL;
                  const status = lifecycleMap[c.lifecycleStatus];
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-surface-container">
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/cases/${c.id}`}
                          className="font-bold text-on-surface hover:text-primary hover:underline"
                        >
                          {c.applicantName}
                        </Link>
                        <p className="mt-1 font-mono text-[11px] text-on-surface-variant">
                          {c.id.substring(0, 8)}
                        </p>
                      </td>
                      <td className="hidden px-6 py-4 text-on-surface-variant sm:table-cell">
                        {c.caseType}
                      </td>
                      <td className="hidden px-6 py-4 lg:table-cell">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${priority.color}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                          {priority.label}
                        </span>
                      </td>
                      <td className="hidden px-6 py-4 text-on-surface-variant lg:table-cell">
                        {new Date(c.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="hidden max-w-[150px] truncate px-6 py-4 text-on-surface-variant xl:table-cell">
                        {c.location}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            status?.color || "bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          {status?.label || c.lifecycleStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/dashboard/cases/${c.id}`}
                            aria-label={`عرض تفاصيل حالة ${c.applicantName}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary"
                          >
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                              visibility
                            </span>
                          </Link>
                          {canManage && c.lifecycleStatus === "DRAFT" && (
                            <Link
                              href={`/dashboard/cases/${c.id}/edit`}
                              aria-label={`تعديل حالة ${c.applicantName}`}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-on-primary"
                            >
                              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                                edit
                              </span>
                            </Link>
                          )}
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(c.id, c.applicantName)}
                              aria-label={`حذف حالة ${c.applicantName}`}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-error/10 text-error transition-colors hover:bg-error hover:text-on-error"
                            >
                              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                                delete
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
