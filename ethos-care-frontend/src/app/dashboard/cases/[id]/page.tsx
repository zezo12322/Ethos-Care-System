"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { casesService } from "@/services/cases.service";
import { CaseHistoryRecord, CaseRecord } from "@/types/api";

export default function CaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const currentRole = user?.role || "CASE_WORKER";

  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const [historyData, setHistoryData] = useState<CaseHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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
          alert("حدث خطأ في تحميل تفاصيل الحالة");
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

  const handleTransition = async (action: string, promptLabel?: string) => {
    try {
      setActionLoading(true);
      const reason =
        promptLabel && typeof window !== "undefined"
          ? window.prompt(promptLabel, "تحديث من النظام") || "تحديث من النظام"
          : "تحديث من النظام";
      await casesService.transition(id, action, reason);
      const [updatedCase, updatedHistory] = await Promise.all([
        casesService.getById(id),
        casesService.getHistory(id),
      ]);
      setCaseData(updatedCase);
      setHistoryData(updatedHistory);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء محاولة تحديث الحالة");
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
      alert("تعذر إنشاء ملف PDF للحالة.");
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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

  // Maps
  const lifecycleMap: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "مسودة", color: "bg-surface-container text-on-surface" },
    INTAKE_REVIEW: { label: "مراجعة مبدئية", color: "bg-warning/20 text-warning" },
    FIELD_VERIFICATION: { label: "تحقق ميداني", color: "bg-warning/30 text-warning-dark" },
    COMMITTEE_REVIEW: { label: "مراجعة اللجنة", color: "bg-tertiary/20 text-tertiary" },
    APPROVED: { label: "في انتظار التنفيذ (مقبول إدارياً)", color: "bg-success/20 text-success" },
    IN_PROGRESS: { label: "قيد التنفيذ", color: "bg-primary/20 text-primary" },
    COMPLETED: { label: "تم النفيذ (مكتملة)", color: "bg-success text-on-success" },
    REJECTED: { label: "مرفوضة إدارياً", color: "bg-error/20 text-error" },
    TECH_REJECTED: { label: "مرفوضة فنياً (لتعذر التنفيذ)", color: "bg-error text-on-error" },
    ON_HOLD: { label: "معلقة", color: "bg-surface-variant text-on-surface-variant" },
    ARCHIVED: { label: "مؤرشفة", color: "bg-outline text-surface" },
  };

  const decisionMap: Record<string, { label: string; bg: string }> = {
    PENDING_DECISION: { label: "قيد القرار", bg: "bg-warning/20 text-warning" },
    APPROVED: { label: "مقبول", bg: "bg-success/20 text-success" },
    REJECTED: { label: "مرفوض", bg: "bg-error/20 text-error" },
    RETURNED_FOR_COMPLETION: { label: "مردود للاستكمال", bg: "bg-tertiary/20 text-tertiary" },
  };

  const completenessMap: Record<string, { label: string; bg: string }> = {
    COMPLETE: { label: "مكتمل الملفات", bg: "bg-primary/20 text-primary" },
    MISSING_NATIONAL_ID: { label: "ينقص رقم قومي", bg: "bg-error/20 text-error" },
    MISSING_DOCUMENTS: { label: "مستندات ناقصة", bg: "bg-warning/20 text-warning" },
  };


  const isCaseWorker =
    currentRole === "CASE_WORKER" ||
    currentRole === "DATA_ENTRY" ||
    currentRole === "ADMIN";
  const isCaseManager =
    currentRole === "MANAGER" ||
    currentRole === "CEO" ||
    currentRole === "ADMIN";
  const isExecOfficer = currentRole === "EXECUTION_OFFICER" || currentRole === "ADMIN";

  const lc = lifecycleMap[caseData.lifecycleStatus] || { label: caseData.lifecycleStatus, color: "bg-surface-container" };
 
  const ds = decisionMap[caseData.decisionStatus] || { label: caseData.decisionStatus, bg: "bg-surface-container" };
  const cs = completenessMap[caseData.completenessStatus] || { label: caseData.completenessStatus, bg: "bg-surface-container" };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-surface border-b border-outline-variant/30 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full hover:bg-surface-variant flex items-center justify-center transition-colors text-on-surface-variant"
              >
                <span className="material-symbols-outlined rtl:rotate-180">arrow_back</span>
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

            <div className="flex gap-3">
              {/* Transition actions based on statuses */}
              
              {/* Case Worker Actions */}
              {isCaseWorker && caseData.lifecycleStatus === 'DRAFT' && (
                <button disabled={actionLoading} onClick={() => handleTransition('review', 'تعليق الباحث عند رفع الحالة من المنطقة')} className="px-5 py-2 bg-warning text-on-warning hover:bg-warning/90 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined">how_to_reg</span>
                  رفع الحالة من المنطقة
                </button>
              )}
              
              {/* Case Management Approval */}
              {isCaseManager && (caseData.decisionStatus === 'PENDING_DECISION' || caseData.lifecycleStatus === 'INTAKE_REVIEW' || caseData.lifecycleStatus === 'COMMITTEE_REVIEW') && (
                <>
                  <button disabled={actionLoading} onClick={() => handleTransition('approve', 'تعليق مسؤول إدارة الحالة عند الاعتماد')} className="px-5 py-2 bg-success text-on-success hover:bg-success/90 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">fact_check</span>
                    اعتماد مسؤول إدارة الحالة
                  </button>
                  <button disabled={actionLoading} onClick={() => handleTransition('return_to_review', 'تعليق مسؤول إدارة الحالة عند إعادة الحالة')} className="px-5 py-2 bg-warning text-on-warning hover:bg-warning/90 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">assignment_return</span>
                    إعادة للباحث الميداني
                  </button>
                  <button disabled={actionLoading} onClick={() => handleTransition('reject', 'تعليق مسؤول إدارة الحالة عند الرفض')} className="px-5 py-2 bg-error text-on-error hover:bg-error/90 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">cancel</span>
                    رفض الحالة
                  </button>
                </>
              )}

              {/* Execution Officer Actions (Technical Execution) */}
              {isExecOfficer && caseData.lifecycleStatus === 'APPROVED' && (
                <>
                  <button disabled={actionLoading} onClick={() => handleTransition('complete', 'تعليق مسؤول التنفيذ عند إتمام التدخل')} className="px-5 py-2 bg-primary text-on-primary hover:bg-primary/90 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">done_all</span>
                    تم التنفيذ بنجاح
                  </button>
                  <button disabled={actionLoading} onClick={() => handleTransition('technical_reject', 'تعليق مسؤول التنفيذ عند تعذر التنفيذ')} className="px-5 py-2 bg-error text-on-error hover:bg-error/90 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">block</span>
                    مرفوض فنياً
                  </button>
                </>
              )}

              <Link href={`/dashboard/cases/${caseData.id}/edit`} className="px-5 py-2 bg-tertiary/10 text-tertiary hover:bg-tertiary/20 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">edit_square</span>
                تعديل الكارت
              </Link>

              <button onClick={() => void handleOpenPdf()} disabled={pdfLoading} className="px-5 py-2 bg-success/10 text-success hover:bg-success/20 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                <span className="material-symbols-outlined text-lg">print</span>
                {pdfLoading ? "جاري إنشاء PDF..." : "PDF من السيرفر"}
              </button>
              
              <Link href="/dashboard/cases" className="px-5 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">list</span>
                العودة لقائمة الحالات
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface border border-outline-variant/30 rounded-2xl p-4 flex gap-3 items-center">
                 <div className={`p-3 rounded-full ${lc.color}`}>
                   <span className="material-symbols-outlined text-lg">autorenew</span>
                 </div>
                 <div>
                   <span className="text-xs text-on-surface-variant block">دورة حياة الحالة</span>
                   <span className="font-bold text-sm">{lc.label}</span>
                 </div>
              </div>
              <div className="bg-surface border border-outline-variant/30 rounded-2xl p-4 flex gap-3 items-center">
                 <div className={`p-3 rounded-full ${ds.bg}`}>
                   <span className="material-symbols-outlined text-lg">gavel</span>
                 </div>
                 <div>
                   <span className="text-xs text-on-surface-variant block">قرار مسؤول إدارة الحالة</span>
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
                    {caseData.priority === 'URGENT' || caseData.priority === 'عاجل' ? <span className="material-symbols-outlined text-base">warning</span> : null}
                    {caseData.priority === 'URGENT' ? 'عاجل' : (caseData.priority === 'HIGH' ? 'عالي' : (caseData.priority === 'NORMAL' ? 'تلقائي' : caseData.priority))}
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

              {caseData.formData?.support ? (
                <div className="mt-8 grid grid-cols-1 gap-4 border-t border-outline-variant/30 pt-6 md:grid-cols-2">
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
                  <div className="rounded-2xl bg-surface-container-lowest p-4">
                    <label className="mb-1 block text-sm text-on-surface-variant">
                      اعتماد مسؤول إدارة الحالة
                    </label>
                    <p className="font-bold text-on-surface">
                      {caseData.formData.support.managerDecision || "بانتظار الاعتماد"}
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {caseData.formData.support.managerComments || "لا توجد تعليقات"}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                سجل التعاملات (History)
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
                      <p className="text-sm text-on-surface-variant mt-1">تم نقل دورة الحياة إلى: <span className="font-bold">{lifecycleMap[item.toLifecycleStatus]?.label || item.toLifecycleStatus}</span> / القرار: <span className="font-bold">{decisionMap[item.toDecisionStatus]?.label || item.toDecisionStatus}</span></p>
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
            <div className="bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-tertiary"></div>
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
