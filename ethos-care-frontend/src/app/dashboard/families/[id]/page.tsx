"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { familiesService } from "@/services/families.service";
import { useAuth } from "@/contexts/AuthContext";
import { CaseRecord, FamilyMemberRecord, FamilyRecord } from "@/types/api";
import {
  ago,
  historyText,
  isOpenCase,
  isStale,
  lifecycleOf,
  priorityOf,
} from "@/lib/caseLabels";

const FAMILY_STATUS_TONE: Record<string, string> = {
  مستحق: "bg-success/15 text-success",
  "غير مستحق": "bg-error/15 text-error",
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("ar-EG") : "غير متوفر";

export default function FamilyDetailsPage() {
  const { user } = useAuth();
  // الطباعة للمدير فقط
  const canPrint = ["ADMIN", "CEO"].includes(user?.role ?? "");
  // الكول سنتر: عرض فقط — لا تعديل/إضافة
  const canManage = (user?.role ?? "") !== "CALL_CENTER";
  const [family, setFamily] = useState<FamilyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const { id: familyId } = useParams<{ id: string }>();

  useEffect(() => {
    let cancelled = false;

    const loadFamily = async () => {
      try {
        const data = await familiesService.getById(familyId);
        if (!cancelled) {
          setFamily(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadFamily();

    return () => {
      cancelled = true;
    };
  }, [familyId]);

  if (loading) return <div className="p-8 text-center">جاري تحميل بيانات الأسرة...</div>;
  if (!family) return <div className="p-8 text-center text-error">حدث خطأ أو لم يتم العثور على الأسرة</div>;

  const cases = family.cases ?? [];
  const openCases = cases.filter(isOpenCase);
  // سجل حركات موحّد لكل حالات الأسرة
  const timeline = cases
    .flatMap((c) => (c.history ?? []).map((h) => ({ ...h, caseRecord: c })))
    .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
    .slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/families" aria-label="رجوع لقائمة الأسر" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-outline-variant/30 hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined rtl:rotate-180">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold font-headline text-on-surface">أسرة / {family.headName || "بدون اسم"}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold font-body ${FAMILY_STATUS_TONE[family.status] ?? "bg-warning/15 text-warning"}`}>
                {family.status}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant font-bold tracking-widest" dir="ltr">{family.id}</p>
          </div>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Link href={`/dashboard/families?edit=${family.id}`} className="px-4 py-2 bg-white border border-outline-variant/50 hover:bg-surface-container-lowest rounded-xl font-bold text-sm text-primary flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">edit</span>
              تعديل الملف
            </Link>
            <Link href={`/dashboard/cases/new?familyId=${family.id}`} className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-md">
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
              حالة جديدة
            </Link>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: "group", tone: "bg-primary/10 text-primary", label: "حجم الأسرة", value: `${family.membersCount || 1} أفراد` },
          { icon: "payments", tone: "bg-tertiary/10 text-tertiary", label: "الدخل التقريبي", value: `${family.income || 0} ج.م` },
          { icon: "folder_open", tone: "bg-warning/10 text-warning", label: "حالات مفتوحة / الإجمالي", value: `${openCases.length} / ${cases.length}` },
          { icon: "event", tone: "bg-primary/10 text-primary", label: "آخر زيارة", value: formatDate(family.lastVisit) },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-outline-variant/30 p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.tone}`}>
              <span className="material-symbols-outlined" aria-hidden="true">{stat.icon}</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">{stat.label}</p>
              <p className="text-lg font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* حالات الأسرة */}
          <div className="bg-white rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <h2 className="font-bold font-headline">حالات الأسرة ({cases.length})</h2>
            </div>
            <div className="p-5 space-y-3">
              {cases.length > 0 ? (
                cases.map((c) => (
                  <FamilyCaseRow key={c.id} caseRecord={c} canManage={canManage} canPrint={canPrint} />
                ))
              ) : (
                <div className="p-6 text-center text-sm text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/50">
                  لا توجد حالات مسجلة لهذه الأسرة حتى الآن.
                  {canManage && (
                    <Link href={`/dashboard/cases/new?familyId=${family.id}`} className="mt-3 block font-bold text-primary hover:underline">
                      سجّل أول حالة
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <h2 className="font-bold font-headline">أفراد الأسرة</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-surface-container-lowest border-b border-outline-variant/30 text-on-surface-variant font-bold">
                  <tr>
                    <th className="px-5 py-3">الاسم</th>
                    <th className="px-5 py-3">صلة القرابة</th>
                    <th className="px-5 py-3 text-center">السن</th>
                    <th className="px-5 py-3">المرحلة الدراسية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  <tr className="hover:bg-surface-container-lowest/50">
                    <td className="px-5 py-3 font-bold">{family.headName || "-"}</td>
                    <td className="px-5 py-3">عائل الأسرة</td>
                    <td className="px-5 py-3 text-center">-</td>
                    <td className="px-5 py-3">-</td>
                  </tr>
                  {family.familyMembers && family.familyMembers.length > 0 ? (
                    family.familyMembers.map((member: FamilyMemberRecord) => (
                      <tr key={member.id} className="hover:bg-surface-container-lowest/50">
                        <td className="px-5 py-3 font-bold">{member.name}</td>
                        <td className="px-5 py-3">{member.relation}</td>
                        <td className="px-5 py-3 text-center">{member.age || "-"}</td>
                        <td className="px-5 py-3">{member.education || "-"}</td>
                      </tr>
                    ))
                  ) : family.membersCount > 1 ? (
                    <tr className="hover:bg-surface-container-lowest/50">
                      <td className="px-5 py-3 text-center text-on-surface-variant italic" colSpan={4}>
                        يوجد عدد {family.membersCount - 1} أفراد تابعين (البيانات التفصيلية غير مسجلة حالياً)
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          {/* سجل حركات الأسرة */}
          <div className="bg-white rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-outline-variant/30 bg-surface-container-lowest">
              <h2 className="font-bold font-headline">سجل الحركات</h2>
            </div>
            {timeline.length === 0 ? (
              <p className="p-5 text-sm text-on-surface-variant">لا توجد حركات بعد.</p>
            ) : (
              <ul className="divide-y divide-outline-variant/20">
                {timeline.map((h) => (
                  <li key={h.id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
                    <p className="min-w-0">
                      <span className="font-bold">{h.performedBy?.name ?? "النظام"}</span> {historyText(h)}
                      {" — "}
                      <Link href={`/dashboard/cases/${h.caseRecord.id}`} className="font-bold text-primary hover:underline">
                        {h.caseRecord.caseType}
                      </Link>
                      {h.reason && <span className="block text-xs text-on-surface-variant mt-0.5">{h.reason}</span>}
                    </p>
                    <span className="shrink-0 text-xs text-on-surface-variant" title={new Date(h.performedAt).toLocaleString("ar-EG")}>
                      {ago(h.performedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-sm">
            <h3 className="font-bold font-headline mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              العنوان والتواصل
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <span className="text-xs text-on-surface-variant block mb-1">الرقم القومي (للعائل)</span>
                <span className="font-bold tracking-widest block" dir="ltr">{family.nationalId || "غير مسجل"}</span>
              </li>
              <li>
                <span className="text-xs text-on-surface-variant block mb-1">المركز / القرية</span>
                <span className="font-bold block">{[family.city, family.village].filter(Boolean).join(" - ") || "غير مسجل"}</span>
              </li>
              <li>
                <span className="text-xs text-on-surface-variant block mb-1">العنوان التفصيلي</span>
                <span className="font-bold block">{family.addressDetails || family.address || "غير مسجل"}</span>
              </li>
              <li>
                <span className="text-xs text-on-surface-variant block mb-1">رقم التليفون</span>
                <span className="font-bold block" dir="ltr">{family.phone || "غير مسجل"}</span>
              </li>
            </ul>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-sm">
            <h3 className="font-bold font-headline mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              ملخص الأسرة
            </h3>
            <p className="text-sm leading-relaxed text-on-surface-variant border-r-2 border-primary pr-3">
              الحالة الاجتماعية: {family.socialStatus} — {family.education ? `المؤهل: ${family.education}` : "بدون مؤهل مسجل"} — {family.job ? `الوظيفة: ${family.job}` : "بدون عمل مسجل"} — {family.income ? `الدخل التقريبي: ${family.income} ج.م` : "لا يوجد دخل مسجل"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FamilyCaseRow({
  caseRecord: c,
  canManage,
  canPrint,
}: {
  caseRecord: CaseRecord;
  canManage: boolean;
  canPrint: boolean;
}) {
  const stage = lifecycleOf(c.lifecycleStatus);
  const priority = priorityOf(c.priority);
  const action = "flex h-9 w-9 items-center justify-center rounded-full transition-colors";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant/30 p-4 transition-colors hover:border-primary/50 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/dashboard/cases/${c.id}`} className="font-bold text-primary hover:underline">
            {c.caseType}
          </Link>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${stage.color}`}>{stage.label}</span>
          {c.priority !== "NORMAL" && (
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${priority.color}`}>{priority.label}</span>
          )}
          {isStale(c) && (
            <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-[11px] font-bold text-warning">متوقفة</span>
          )}
        </div>
        {c.description && <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant">{c.description}</p>}
        <p className="mt-1.5 text-[11px] text-on-surface-variant">
          سُجّلت {formatDate(c.createdAt)}
          {c.lastActionAt && ` · آخر إجراء ${ago(c.lastActionAt)}`}
          {` · المسؤول: ${c.assignedTo?.name ?? "غير مُسندة"}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Link href={`/dashboard/cases/${c.id}`} aria-label="فتح الحالة" className={`${action} bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-on-primary`}>
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">visibility</span>
        </Link>
        {canManage && c.lifecycleStatus === "DRAFT" && (
          <Link href={`/dashboard/cases/${c.id}/edit`} aria-label="تعديل الحالة" className={`${action} bg-primary/10 text-primary hover:bg-primary hover:text-on-primary`}>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">edit</span>
          </Link>
        )}
        {canPrint && (
          <Link href={`/dashboard/cases/${c.id}/print`} aria-label="طباعة استمارة الحالة" className={`${action} bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-on-primary`}>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">print</span>
          </Link>
        )}
      </div>
    </div>
  );
}
