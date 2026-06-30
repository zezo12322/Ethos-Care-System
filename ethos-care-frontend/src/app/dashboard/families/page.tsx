"use client";

import Link from "next/link";
import React, {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from "react";
import { familiesService } from "@/services/families.service";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { FamilyRecord } from "@/types/api";
import SortableTh from "@/components/ui/SortableTh";
import {
  useTableSort,
  compareText,
  compareNumber,
  compareDate,
  compareByRank,
  type SortComparator,
} from "@/hooks/useTableSort";

interface EditingFamilyState {
  id: string;
  headName: string;
  membersCount: number;
  income: string;
  address: string;
  phone: string;
  status: string;
}

type FamilyStatusFilter = "ALL" | "تحت التقييم" | "مستحق" | "غير مستحق";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("ar-EG").format(value);

const sanitizeCsvCell = (value: string | number | null | undefined) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

const parseIncome = (value?: string | null) => {
  if (!value) {
    return 0;
  }

  const normalized = String(value).replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const FAMILY_STATUS_RANK: Record<string, number> = {
  مستحق: 2,
  "تحت التقييم": 1,
  "غير مستحق": 0,
};

const FAMILY_SORT_COMPARATORS: Record<string, SortComparator<FamilyRecord>> = {
  name: (a, b) => compareText(a.headName, b.headName),
  members: (a, b) => compareNumber(a.membersCount, b.membersCount),
  income: (a, b) => compareNumber(parseIncome(a.income), parseIncome(b.income)),
  lastVisit: (a, b) => compareDate(a.lastVisit, b.lastVisit),
  status: (a, b) => compareByRank(FAMILY_STATUS_RANK, a.status, b.status),
};

export default function FamiliesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  // الكول سنتر: عرض فقط — لا إضافة/تعديل/حذف
  const canManage = (user?.role ?? "") !== "CALL_CENTER";
  const [families, setFamilies] = useState<FamilyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [statusFilter, setStatusFilter] = useState<FamilyStatusFilter>("ALL");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<EditingFamilyState | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const data = await familiesService.getAll({
          search: deferredSearch || undefined,
          status: statusFilter === "ALL" ? undefined : statusFilter,
        });

        if (active) {
          setFamilies(data);
        }
      } catch (loadError) {
        console.error(loadError);
        if (active) {
          setFamilies([]);
          setError("تعذر تحميل الأسر الآن.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, deferredSearch ? 250 : 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [deferredSearch, reloadKey, statusFilter]);

  const refreshFamilies = () => setReloadKey((current) => current + 1);

  const handleEditClick = (family: FamilyRecord) => {
    setEditingFamily({
      id: family.id,
      headName: family.headName,
      membersCount: family.membersCount,
      income: (family.income || "").replace(" ج.م", ""),
      address: family.address || "",
      phone: family.phone || "",
      status: family.status,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateFamily = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingFamily) {
      return;
    }

    try {
      await familiesService.update(editingFamily.id, {
        headName: editingFamily.headName,
        membersCount: editingFamily.membersCount,
        income: editingFamily.income,
        address: editingFamily.address,
        phone: editingFamily.phone,
        status: editingFamily.status,
      });

      setIsEditModalOpen(false);
      setEditingFamily(null);
      refreshFamilies();
    } catch (updateError) {
      console.error(updateError);
      toast("حدث خطأ أثناء تعديل بيانات الأسرة", "error");
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الأسرة؟")) {
      return;
    }

    try {
      await familiesService.remove(id);
      refreshFamilies();
    } catch (deleteError) {
      console.error(deleteError);
      toast("تعذر حذف ملف الأسرة الآن.", "error");
    }
  };

  const summary = {
    totalFamilies: families.length,
    totalMembers: families.reduce(
      (total, family) => total + (family.membersCount || 0),
      0,
    ),
    eligibleFamilies: families.filter((family) => family.status === "مستحق")
      .length,
    averageIncome:
      families.length > 0
        ? Math.round(
            families.reduce(
              (total, family) => total + parseIncome(family.income),
              0,
            ) / families.length,
          )
        : 0,
  };

  const { sorted: sortedFamilies, sort, toggleSort } = useTableSort(
    families,
    FAMILY_SORT_COMPARATORS,
  );

  const handleExport = () => {
    const rows = [
      [
        "رقم الملف",
        "اسم العائل",
        "الرقم القومي",
        "عدد الأفراد",
        "الدخل",
        "العنوان",
        "الهاتف",
        "حالة التقييم",
        "آخر زيارة",
      ],
      ...families.map((family) => [
        family.id,
        family.headName,
        family.nationalId || "",
        family.membersCount,
        family.income || "",
        family.address || "",
        family.phone || "",
        family.status,
        family.lastVisit || "",
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => sanitizeCsvCell(cell)).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `families_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="border-r-4 border-secondary pr-4">
          <h1 className="text-3xl font-bold font-headline text-on-surface">
            إدارة ملفات الأسر
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            شاشة أخف لإدارة الأسر بالبحث المباشر، فلترة الاستحقاق، وتحديث
            السجلات بسرعة.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => void handleExport()}
            className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            تصدير
          </button>
          <button
            onClick={refreshFamilies}
            className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            تحديث
          </button>
          {canManage && (
            <Link
              href="/dashboard/families/new"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-all hover:bg-primary-container shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined">add</span>
              إضافة ملف أسرة
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "عدد الأسر",
            value: formatNumber(summary.totalFamilies),
            icon: "family_restroom",
            tone: "text-primary bg-primary/10",
          },
          {
            label: "إجمالي الأفراد",
            value: formatNumber(summary.totalMembers),
            icon: "groups",
            tone: "text-primary bg-primary/10",
          },
          {
            label: "أسر مستحقة",
            value: formatNumber(summary.eligibleFamilies),
            icon: "verified_user",
            tone: "text-success bg-success/10",
          },
          {
            label: "متوسط الدخل",
            value: `${formatNumber(summary.averageIncome)} ج.م`,
            icon: "payments",
            tone: "text-tertiary bg-tertiary/10",
          },
        ].map((card, i) => (
          <div
            key={card.label}
            className="rounded-3xl border border-outline-variant/30 bg-white p-5 shadow-sm animate-stagger"
            style={{ "--stagger": i } as React.CSSProperties}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface-variant">
                  {card.label}
                </p>
                <p className="mt-3 text-2xl font-bold font-headline text-on-surface">
                  {card.value}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.tone}`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {card.icon}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-outline-variant/30 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/30 bg-surface-container-lowest/50 p-4">
          <div className="flex w-full items-center gap-2 rounded-xl border border-outline-variant/50 bg-white px-3 py-2 transition-colors focus-within:border-primary md:w-96">
            <span className="material-symbols-outlined text-outline">search</span>
            <input
              type="text"
              value={searchInput}
              onChange={(event) => {
                const nextValue = event.target.value;
                startTransition(() => {
                  setSearchInput(nextValue);
                });
              }}
              placeholder="بحث بالاسم أو الرقم القومي أو الهاتف أو العنوان..."
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-outline"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as FamilyStatusFilter,
                )
              }
              className="rounded-xl border border-outline-variant/50 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="ALL">كل حالات التقييم</option>
              <option value="تحت التقييم">تحت التقييم</option>
              <option value="مستحق">مستحق</option>
              <option value="غير مستحق">غير مستحق</option>
            </select>

            <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-on-surface-variant">
              {loading ? "..." : `${formatNumber(families.length)} نتيجة`}
            </span>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm font-bold text-error">
            {error}
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
                  اسم العائل / رقم الملف
                </SortableTh>
                <SortableTh
                  sortKey="members"
                  activeKey={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                  className="hidden sm:table-cell"
                >
                  أفراد الأسرة
                </SortableTh>
                <SortableTh
                  sortKey="income"
                  activeKey={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                  className="hidden lg:table-cell"
                >
                  متوسط الدخل
                </SortableTh>
                <th scope="col" className="hidden px-6 py-4 font-bold xl:table-cell">العنوان</th>
                <th scope="col" className="hidden px-6 py-4 font-bold xl:table-cell">الهاتف</th>
                <SortableTh
                  sortKey="lastVisit"
                  activeKey={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                  className="hidden lg:table-cell"
                >
                  آخر زيارة
                </SortableTh>
                <SortableTh
                  sortKey="status"
                  activeKey={sort.key}
                  direction={sort.direction}
                  onSort={toggleSort}
                >
                  حالة التقييم
                </SortableTh>
                <th scope="col" className="px-6 py-4 text-center font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm font-medium">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-6 py-3">
                      <div className="h-10 animate-pulse rounded-xl bg-surface-container-low" />
                    </td>
                  </tr>
                ))
              ) : families.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <span
                      className="material-symbols-outlined mb-3 text-5xl text-outline"
                      aria-hidden="true"
                    >
                      {searchInput.trim() || statusFilter !== "ALL"
                        ? "search_off"
                        : "groups"}
                    </span>
                    {searchInput.trim() || statusFilter !== "ALL" ? (
                      <>
                        <p className="mb-1 text-base font-bold text-on-surface">
                          لا توجد أسر مطابقة
                        </p>
                        <p className="text-sm text-on-surface-variant">
                          جرّب تعديل البحث أو فلتر الاستحقاق.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mb-1 text-base font-bold text-on-surface">
                          لا توجد ملفات أسر بعد
                        </p>
                        <p className="mb-5 text-sm text-on-surface-variant">
                          ابدأ بإضافة أول ملف أسرة لإدارته ومتابعته هنا.
                        </p>
                        {canManage && (
                          <Link
                            href="/dashboard/families/new"
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-colors hover:bg-primary/90"
                          >
                            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                              add
                            </span>
                            إضافة ملف أسرة
                          </Link>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                sortedFamilies.map((family) => (
                  <tr
                    key={family.id}
                    className="transition-colors hover:bg-surface-container"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/families/${family.id}`}
                        className="font-bold text-on-surface hover:text-primary hover:underline"
                      >
                        {family.headName}
                      </Link>
                      <p className="mt-1 font-mono text-xs text-on-surface-variant">
                        {family.id.substring(0, 8)}
                        {family.nationalId ? ` • ${family.nationalId}` : ""}
                      </p>
                    </td>
                    <td className="hidden px-6 py-4 sm:table-cell">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-1 text-xs font-bold text-on-surface">
                        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                          groups
                        </span>
                        {family.membersCount} أفراد
                      </span>
                    </td>
                    <td
                      className="hidden px-6 py-4 text-left text-on-surface-variant lg:table-cell"
                      dir="ltr"
                    >
                      {family.income}
                    </td>
                    <td className="hidden max-w-[220px] px-6 py-4 text-on-surface-variant xl:table-cell">
                      <span className="line-clamp-2">
                        {family.address || family.city || "غير محدد"}
                      </span>
                    </td>
                    <td className="hidden px-6 py-4 text-on-surface-variant xl:table-cell">
                      {family.phone || "غير محدد"}
                    </td>
                    <td className="hidden px-6 py-4 text-on-surface-variant lg:table-cell">
                      {family.lastVisit}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                          family.status === "مستحق"
                            ? "bg-success/15 text-success"
                            : family.status === "غير مستحق"
                              ? "bg-error/15 text-error"
                              : "bg-warning/15 text-warning"
                        }`}
                      >
                        {family.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/dashboard/families/${family.id}`}
                          aria-label={`تفاصيل أسرة ${family.headName}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary"
                        >
                          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                            visibility
                          </span>
                        </Link>
                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEditClick(family)}
                              aria-label={`تعديل أسرة ${family.headName}`}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-on-primary"
                            >
                              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                                edit
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteClick(family.id)}
                              aria-label={`حذف أسرة ${family.headName}`}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-error/10 text-error transition-colors hover:bg-error hover:text-on-error"
                            >
                              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                                delete
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && editingFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 leading-relaxed shadow-xl animate-scale-in">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">تعديل بيانات الأسرة</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateFamily} className="space-y-4 text-right">
              <div>
                <label className="mb-2 block text-sm font-bold">اسم العائل</label>
                <input
                  required
                  type="text"
                  value={editingFamily.headName}
                  onChange={(event) =>
                    setEditingFamily({
                      ...editingFamily,
                      headName: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold">عدد الأفراد</label>
                  <input
                    required
                    type="number"
                    value={editingFamily.membersCount}
                    onChange={(event) =>
                      setEditingFamily({
                        ...editingFamily,
                        membersCount: Number(event.target.value) || 1,
                      })
                    }
                    className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    متوسط الدخل
                  </label>
                  <input
                    required
                    type="number"
                    value={editingFamily.income}
                    onChange={(event) =>
                      setEditingFamily({
                        ...editingFamily,
                        income: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">العنوان</label>
                <input
                  required
                  type="text"
                  value={editingFamily.address}
                  onChange={(event) =>
                    setEditingFamily({
                      ...editingFamily,
                      address: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">الهاتف</label>
                <input
                  required
                  type="text"
                  value={editingFamily.phone}
                  onChange={(event) =>
                    setEditingFamily({
                      ...editingFamily,
                      phone: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 text-left outline-none focus:border-primary"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold">
                  حالة التقييم
                </label>
                <select
                  value={editingFamily.status}
                  onChange={(event) =>
                    setEditingFamily({
                      ...editingFamily,
                      status: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 outline-none focus:border-primary"
                >
                  <option value="تحت التقييم">تحت التقييم</option>
                  <option value="مستحق">مستحق</option>
                  <option value="غير مستحق">غير مستحق</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-3 font-bold text-white transition-colors hover:bg-primary-container"
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 rounded-xl bg-surface-container-highest py-3 font-bold text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
