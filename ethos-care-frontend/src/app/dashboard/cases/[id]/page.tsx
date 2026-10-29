"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { casesService } from "@/services/cases.service";
import { CaseHistoryRecord, CaseRecord } from "@/types/api";
import { useToast } from "@/components/ui/Toast";
import { DIRECTOR_ACTIONS, latestDirectorOpinion, lifecycleOf } from "@/lib/caseLabels";
import { isDirector } from "@/lib/roles";

/* ──────────────────────────────────────────────
 *  Lifecycle:
 *    DRAFT (مع الباحث) → REVIEW (بانتظار قرار المدير) → APPROVED → EXECUTION → COMPLETED
 *                                                   ↘ REJECTED
 *  المتطوع يرفع الحالة، الباحث يرفع قراره (موافقة/رفض) للمدير، والمدير يعتمد.
 * ────────────────────────────────────────────── */

const LIFECYCLE_STEPS = [
  { key: "DRAFT", label: "مع الباحث", icon: "edit_note" },
  { key: "REVIEW", label: "بانتظار قرار المدير", icon: "gavel" },
  { key: "APPROVED", label: "معتمدة", icon: "check_circle" },
  { key: "EXECUTION", label: "تنفيذ", icon: "engineering" },
  { key: "COMPLETED", label: "مكتمل", icon: "task_alt" },
] as const;

// قرارات الباحث التي يمكن رفعها للمدير
const ESCALATED_OPINIONS = ["موافقة", "رفض"];

const decisionMap: Record<string, { label: string; bg: string }> = {
  PENDING_DECISION: { label: "قيد القرار", bg: "bg-warning/15 text-warning" },
  APPROVED: { label: "مقبول", bg: "bg-success/15 text-success" },
  REJECTED: { label: "مرفوض", bg: "bg-error/15 text-error" },
  RETURNED_FOR_COMPLETION: { label: "مردود للاستكمال", bg: "bg-warning/15 text-warning" },
};

const completenessMap: Record<string, { label: string; bg: string }> = {
  COMPLETE: { label: "مكتمل الملفات", bg: "bg-success/15 text-success" },
  MISSING_NATIONAL_ID: { label: "ينقص رقم قومي", bg: "bg-error/15 text-error" },
  MISSING_DOCUMENTS: { label: "مستندات ناقصة", bg: "bg-warning/15 text-warning" },
};

function getStepIndex(status: string): number {
  const idx = LIFECYCLE_STEPS.findIndex((s) => s.key === (status === "FIELD_VERIFICATION" ? "REVIEW" : status));
  return idx >= 0 ? idx : 0;
}

/* ──────────────────────────────────────────────
 *  Stepper Component
 * ────────────────────────────────────────────── */

function CaseLifecycleStepper({ currentStatus }: { currentStatus: string }) {
  if (currentStatus === "REJECTED") {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-error/30 bg-error/10 p-4 font-bold text-error">
        <span className="material-symbols-outlined">block</span>
        رفض المدير هذه الحالة
      </div>
    );
  }
  const currentIdx = getStepIndex(currentStatus);

  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-3xl border border-outline-variant/30 bg-white p-4 shadow-sm">
      {LIFECYCLE_STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isResearcher = idx === 0;

        return (
          <React.Fragment key={step.key}>
            {idx > 0 && (
              <div
                className={`hidden h-0.5 flex-1 sm:block ${
                  isCompleted ? "bg-primary" : "bg-outline-variant/30"
                }`}
              />
            )}
            <div className="flex flex-col items-center gap-1.5 px-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm transition-all ${
                  isCompleted
                    ? "bg-primary text-on-primary"
                    : isCurrent
                      ? "bg-primary/20 text-primary ring-2 ring-primary"
                      : "bg-surface-container text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {isCompleted ? "check" : step.icon}
                </span>
              </div>
              <span
                className={`text-center text-[11px] font-bold leading-tight ${
                  isCurrent ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {step.label}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                  isResearcher
                    ? "bg-primary/10 text-primary"
                    : "bg-tertiary/10 text-tertiary"
                }`}
              >
                {isResearcher ? "الباحث" : "المدير"}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────
 *  Page Component
 * ────────────────────────────────────────────── */

export default function CaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const currentRole = user?.role || "CASE_WORKER";

  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const [historyData, setHistoryData] = useState<CaseHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [directorNote, setDirectorNote] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        const [caseResponse, historyResponse] = await Promise.all([
          casesService.getById(id),
          casesService.getHistory(id),
        ]);

        if (!cancelled) {
          setCaseData(caseResponse);
          setHistoryData(historyResponse);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          toast("حدث خطأ في تحميل تفاصيل الحالة", "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleTransition = async (action: string, promptLabel?: string, presetReason?: string) => {
    try {
      setActionLoading(true);
      const reason =
        presetReason !== undefined
          ? presetReason || undefined
          : promptLabel && typeof window !== "undefined"
            ? window.prompt(promptLabel, "تحديث من النظام") || "تحديث من النظام"
            : "تحديث من النظام";
      await casesService.transition(id, action, reason);
      const [updatedCase, updatedHistory] = await Promise.all([
        casesService.getById(id),
        casesService.getHistory(id),
      ]);
      setCaseData(updatedCase);
      setHistoryData(updatedHistory);
      setDirectorNote("");
    } catch (err) {
      console.error(err);
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast(message || "حدث خطأ أثناء محاولة تحديث الحالة", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPdf = async () => {
    try {
      setPdfLoading(true);
      const blob = await casesService.getPdf(id);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (error) {
      console.error(error);
      toast("تعذر إنشاء ملف PDF للحالة", "error");
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6 px-6 py-8" aria-busy="true" aria-label="جاري تحميل تفاصيل الحالة">
        <div className="h-9 w-64 animate-pulse rounded-2xl bg-surface-container-high" />
        <div className="h-20 animate-pulse rounded-3xl bg-surface-container-low" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface-container-low" />
              ))}
            </div>
            <div className="h-72 animate-pulse rounded-3xl bg-surface-container-low" />
          </div>
          <div className="h-80 animate-pulse rounded-3xl bg-surface-container-low" />
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col gap-4">
        <span className="material-symbols-outlined text-6xl text-error">error</span>
        <h2 className="text-2xl font-bold">الحالة غير موجودة</h2>
        <button onClick={() => router.back()} className="text-primary hover:underline">
          العودة للسابقة
        </button>
      </div>
    );
  }

  const isResearcher =
    currentRole === "CASE_WORKER" ||
    currentRole === "ADMIN";
  const isCaseManager = isDirector(currentRole);
  const opinion = caseData.formData?.support?.specialistOpinion ?? "";
  const canEscalate = ESCALATED_OPINIONS.includes(opinion);
  const awaitingDirector = ["REVIEW", "FIELD_VERIFICATION"].includes(caseData.lifecycleStatus);

  const lc = lifecycleOf(caseData.lifecycleStatus);
  const directorOpinion = latestDirectorOpinion(historyData);
  const ds = decisionMap[caseData.decisionStatus] || { label: caseData.decisionStatus, bg: "bg-surface-container" };
  const cs = completenessMap[caseData.completenessStatus] || { label: caseData.completenessStatus, bg: "bg-surface-container" };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-surface border-b border-outline-variant/30 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          {/* Breadcrumb */}
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-on-surface-variant">
            <Link href="/dashboard" className="hover:text-primary transition-colors">لوحة التحكم</Link>
            <span className="material-symbols-outlined text-sm rtl:rotate-180">chevron_right</span>
            <Link href={caseData.familyId ? `/dashboard/families/${caseData.familyId}` : "/dashboard/families"} className="hover:text-primary transition-colors">ملف الأسرة</Link>
            <span className="material-symbols-outlined text-sm rtl:rotate-180">chevron_right</span>
            <span className="font-bold text-on-surface">{caseData.id.slice(0, 8).toUpperCase()}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-4 items-center">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="العودة للصفحة السابقة"
                className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-variant"
              >
                <span className="material-symbols-outlined rtl:rotate-180" aria-hidden="true">arrow_back</span>
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-on-surface">{caseData.applicantName}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${lc.color}`}>
                    {lc.label}
                  </span>
                </div>
                <p className="text-on-surface-variant text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">tag</span>
                  الحالة: {caseData.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* ── الباحث: رفع القرار (موافقة/رفض) للمدير ── */}
              {isResearcher && caseData.lifecycleStatus === "DRAFT" && (
                <button
                  disabled={actionLoading || !canEscalate}
                  title={canEscalate ? undefined : "اختر رأي الباحث «موافقة» أو «رفض» من تعديل الكارت أولًا — «استكمال الأوراق» لا يُرفع للمدير"}
                  onClick={() => handleTransition("review", `تعليق الباحث عند رفع قرار «${opinion}» للمدير`)}
                  className="px-5 py-2 bg-warning text-on-warning hover:bg-warning/90 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">upload</span>
                  {canEscalate ? `رفع «${opinion}» للمدير` : "استكمال الأوراق"}
                </button>
              )}

              {/* APPROVED → EXECUTION */}
              {isCaseManager && caseData.lifecycleStatus === "APPROVED" && (
                <button disabled={actionLoading} onClick={() => handleTransition("execute", "تعليق المدير عند بدء التنفيذ")} className="px-5 py-2 bg-primary text-on-primary hover:bg-primary/90 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined">engineering</span>
                  بدء التنفيذ
                </button>
              )}

              {/* EXECUTION → COMPLETED */}
              {isCaseManager && caseData.lifecycleStatus === "EXECUTION" && (
                <button disabled={actionLoading} onClick={() => handleTransition("complete", "تعليق المدير عند إتمام التنفيذ")} className="px-5 py-2 bg-success text-on-success hover:bg-success/90 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined">task_alt</span>
                  تم التنفيذ
                </button>
              )}

              {/* المدير: إعادة للباحث من أي مرحلة */}
              {isCaseManager && !awaitingDirector && caseData.lifecycleStatus !== "DRAFT" && caseData.lifecycleStatus !== "COMPLETED" && (
                <button disabled={actionLoading} onClick={() => handleTransition("return_to_draft", "تعليق المدير عند إعادة الحالة للباحث")} className="px-5 py-2 bg-error/10 text-error hover:bg-error/20 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined">assignment_return</span>
                  إعادة للباحث
                </button>
              )}

              {/* التعديل متاح فقط قبل رفع الحالة للمراجعة (مرحلة المسودة) */}
              {currentRole !== "CALL_CENTER" && caseData.lifecycleStatus === "DRAFT" && (
                <Link href={`/dashboard/cases/${caseData.id}/edit`} className="px-5 py-2 bg-tertiary/10 text-tertiary hover:bg-tertiary/20 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">edit_square</span>
                  تعديل الكارت
                </Link>
              )}

              {/* الطباعة للمدير فقط */}
              {isCaseManager && (
                <button onClick={() => void handleOpenPdf()} disabled={pdfLoading} className="px-5 py-2 bg-surface-container-high text-on-surface hover:bg-surface-container-highest rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-lg">print</span>
                  {pdfLoading ? "جاري إنشاء PDF..." : "PDF من السيرفر"}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Lifecycle Stepper */}
        <div className="mb-8">
          <CaseLifecycleStepper currentStatus={caseData.lifecycleStatus} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

            {/* Status overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface border border-outline-variant/30 rounded-2xl p-4 flex gap-3 items-center">
                 <div className={`p-3 rounded-full ${lc.color}`}>
                   <span className="material-symbols-outlined text-lg">autorenew</span>
                 </div>
                 <div>
                   <span className="text-xs text-on-surface-variant block">مرحلة الحالة</span>
                   <span className="font-bold text-sm">{lc.label}</span>
                 </div>
              </div>
              <div className="bg-surface border border-outline-variant/30 rounded-2xl p-4 flex gap-3 items-center">
                 <div className={`p-3 rounded-full ${ds.bg}`}>
                   <span className="material-symbols-outlined text-lg">gavel</span>
                 </div>
                 <div>
                   <span className="text-xs text-on-surface-variant block">قرار المدير</span>
                   <span className="font-bold text-sm">{ds.label}</span>
                 </div>
              </div>
              <div className="bg-surface border border-outline-variant/30 rounded-2xl p-4 flex gap-3 items-center">
                 <div className={`p-3 rounded-full ${cs.bg}`}>
                   <span className="material-symbols-outlined text-lg">task</span>
                 </div>
                 <div>
                   <span className="text-xs text-on-surface-variant block">حالة استيفاء الملف</span>
                   <span className="font-bold text-sm">{cs.label}</span>
                 </div>
              </div>
            </div>

            <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                تفاصيل الحالة
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-on-surface-variant mb-1 block">نوع التدخل المطلوب</label>
                  <p className="font-bold text-on-surface">{caseData.caseType}</p>
                </div>
                <div>
                  <label className="text-sm text-on-surface-variant mb-1 block">الأولوية</label>
                  <p className={`font-bold inline-flex items-center gap-1 ${caseData.priority === 'URGENT' || caseData.priority === 'عاجل' ? 'text-error' : 'text-on-surface'}`}>
                    {caseData.priority === 'URGENT' || caseData.priority === 'عاجل' ? <span className="material-symbols-outlined text-base" aria-hidden="true">warning</span> : null}
                    {caseData.priority === 'URGENT' ? 'عاجل' : (caseData.priority === 'HIGH' ? 'عالي' : (caseData.priority === 'NORMAL' ? 'عادي' : caseData.priority))}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-on-surface-variant mb-1 block">تاريخ التسجيل</label>
                  <p className="font-bold text-on-surface">{new Date(caseData.createdAt).toLocaleDateString("ar-EG")}</p>
                </div>
                <div>
                  <label className="text-sm text-on-surface-variant mb-1 block">الرقم القومي المحول</label>
                  <p className="font-bold text-on-surface">{caseData.nationalId || "غير متوفر"}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-on-surface-variant mb-1 block">الموقع الميداني</label>
                  <p className="font-bold text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-base text-on-surface-variant">location_on</span>
                    {caseData.location}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-outline-variant/30">
                <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">description</span>
                  وصف الحالة والأسباب
                </h3>
                <p className="text-on-surface-variant leading-relaxed p-4 bg-surface-container-lowest rounded-xl">
                  {caseData.description || "لا يوجد وصف مدون لهذه الحالة."}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 border-t border-outline-variant/30 pt-6 md:grid-cols-2">
              {caseData.formData?.support ? (
                  <div className="rounded-2xl bg-surface-container-lowest p-4">
                    <label className="mb-1 block text-sm text-on-surface-variant">
                      رأي الباحث
                    </label>
                    <p className="font-bold text-on-surface">
                      {caseData.formData.support.specialistOpinion || "غير محدد"}
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {caseData.formData.support.specialistNotes || "لا توجد ملاحظات"}
                    </p>
                  </div>
              ) : null}

                {/* رأي المدير: قراره الأخير وتعليقه، أو خانة القرار لو الحالة بانتظاره */}
                <div className="rounded-2xl bg-surface-container-lowest p-4">
                  <label className="mb-1 block text-sm text-on-surface-variant">رأي المدير</label>
                  {isCaseManager && awaitingDirector ? (
                    <div className="space-y-3">
                      <textarea
                        rows={3}
                        value={directorNote}
                        onChange={(event) => setDirectorNote(event.target.value)}
                        placeholder="اكتب رأيك وسبب قرارك..."
                        className="w-full rounded-xl border border-outline-variant/50 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button disabled={actionLoading} onClick={() => handleTransition("approve", undefined, directorNote.trim())} className="flex items-center gap-1.5 rounded-xl bg-success px-4 py-2 text-sm font-bold text-on-success hover:bg-success/90 disabled:opacity-60">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          اعتماد
                        </button>
                        <button disabled={actionLoading} onClick={() => handleTransition("reject", undefined, directorNote.trim())} className="flex items-center gap-1.5 rounded-xl bg-error px-4 py-2 text-sm font-bold text-on-error hover:bg-error/90 disabled:opacity-60">
                          <span className="material-symbols-outlined text-[18px]">block</span>
                          رفض
                        </button>
                        <button disabled={actionLoading} onClick={() => handleTransition("return_to_draft", undefined, directorNote.trim())} className="flex items-center gap-1.5 rounded-xl bg-surface-container-high px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-highest disabled:opacity-60">
                          <span className="material-symbols-outlined text-[18px]">assignment_return</span>
                          إعادة للباحث
                        </button>
                      </div>
                    </div>
                  ) : directorOpinion ? (
                    <>
                      <p className="font-bold text-on-surface">{DIRECTOR_ACTIONS[directorOpinion.action]}</p>
                      <p className="mt-2 text-sm text-on-surface-variant">{directorOpinion.reason || "بدون تعليق"}</p>
                      <p className="mt-2 text-xs text-on-surface-variant">
                        {directorOpinion.performedBy?.name ?? "المدير"} · {new Date(directorOpinion.performedAt).toLocaleDateString("ar-EG")}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-on-surface-variant">
                      {awaitingDirector ? "بانتظار قرار المدير." : "لم يُرفع للمدير بعد."}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                سجل التعاملات
              </h2>
              <div className="relative border-r-2 border-outline-variant/50 pr-6 gap-6 flex flex-col rtl:border-l-2 rtl:border-r-0 rtl:pl-6 rtl:pr-0">
                {historyData.map((item) => (
                  <div key={item.id} className="relative">
                    <div className="absolute top-1 -right-8 rtl:-left-8 w-4 h-4 rounded-full bg-primary border-4 border-surface shadow-sm"></div>
                    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 -mt-2">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-on-surface">{item.action === 'CREATED_WITH_FAMILY' || item.action === 'CREATED' ? 'إنشاء الحالة' : `تحديث: ${item.action}`}</h4>
                        <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">
                          {new Date(item.performedAt).toLocaleString("ar-EG")}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant mt-1">
                        المرحلة: <span className="font-bold">{lifecycleOf(item.toLifecycleStatus).label}</span>
                        {" / "}
                        القرار: <span className="font-bold">{decisionMap[item.toDecisionStatus]?.label || item.toDecisionStatus}</span>
                      </p>
                      {item.performedBy?.name ? (
                        <p className="text-xs text-on-surface-variant mt-2">
                          بواسطة: <span className="font-bold">{item.performedBy.name}</span>
                        </p>
                      ) : null}
                      {item.reason && (
                        <p className="text-sm mt-2 text-primary font-medium bg-primary/5 p-2 rounded-lg border border-primary/10">ملاحظة: {item.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
                {historyData.length === 0 && (
                  <p className="text-on-surface-variant text-sm">لا توجد حركات مسجلة</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">family_home</span>
                الأسرة المرتبطة
              </h2>

              {caseData.family ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-tertiary/10 rounded-full flex items-center justify-center text-tertiary">
                      <span className="material-symbols-outlined text-2xl">group</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface">{caseData.family.headName}</h3>
                      <p className="text-sm text-on-surface-variant">{caseData.family.membersCount} أفراد</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-on-surface-variant w-5">phone</span>
                      <span className="text-on-surface font-medium">{caseData.family.phone || 'بدون رقم'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-on-surface-variant w-5">location_on</span>
                      <span className="text-on-surface font-medium truncate">{caseData.family.address || 'بدون عنوان'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-on-surface-variant w-5">work</span>
                      <span className="text-on-surface font-medium">{caseData.family.job || 'لا يوجد وظيفة'}</span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/families/${caseData.familyId}`}
                    className="w-full py-2.5 bg-tertiary/10 text-tertiary hover:bg-tertiary/20 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <span>فتح ملف الأسرة</span>
                    <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                  </Link>
                </>
              ) : (
                <p className="text-sm text-on-surface-variant">لا توجد أسرة مرتبطة مباشرة أو حدث خطأ في استرجاعها.</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
