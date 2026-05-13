"use client";

import { publicService } from "@/services/public.service";
import PublicFooter from "@/components/layout/PublicFooter";
import PublicHeader from "@/components/layout/PublicHeader";
import { VerifyMemberResponse, VerifyRequestResponse } from "@/types/api";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";
import { ReactNode, Suspense, useEffect, useState } from "react";

function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
      {children}
    </span>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestData, setRequestData] = useState<VerifyRequestResponse | null>(null);
  const [memberData, setMemberData] = useState<VerifyMemberResponse | null>(null);

  useEffect(() => {
    const loadVerification = async () => {
      if (!type || !id) {
        setError("أدخل نوع التحقق والرقم المطلوب في رابط الصفحة.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setRequestData(null);
      setMemberData(null);

      try {
        if (type === "member") {
          const response = await publicService.verifyMember(id);
          setMemberData(response);
        } else {
          const response = await publicService.verifyRequest(id);
          setRequestData(response);
        }
      } catch (loadError) {
        console.error(loadError);
        const message =
          loadError instanceof AxiosError
            ? loadError.response?.data?.message
            : "تعذر تنفيذ عملية التحقق الآن.";
        setError(typeof message === "string" ? message : "تعذر تنفيذ عملية التحقق الآن.");
      } finally {
        setLoading(false);
      }
    };

    void loadVerification();
  }, [id, type]);

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-outline-variant/30 shadow-sm text-center max-w-2xl mx-auto">
        <p className="text-lg font-bold text-on-surface">جارٍ التحقق من البيانات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-outline-variant/30 shadow-sm text-center max-w-2xl mx-auto">
        <span className="material-symbols-outlined text-6xl text-error mb-6">error</span>
        <h2 className="text-3xl font-bold text-on-surface mb-4">تعذر العثور على نتيجة</h2>
        <p className="text-lg text-on-surface-variant mb-6">{error}</p>
        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/50 text-sm text-on-surface-variant">
          تأكد من الرقم المدخل أو أعد المحاولة لاحقًا.
        </div>
      </div>
    );
  }

  if (requestData) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-outline-variant/30 shadow-sm max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-6xl text-primary mb-6">verified</span>
          <h2 className="text-3xl font-bold text-on-surface mb-4">نتيجة التحقق من الطلب</h2>
          <p className="text-lg text-on-surface-variant">
            رقم الطلب:
            <strong className="text-primary mr-2" dir="ltr">{requestData.id}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
            <p className="text-on-surface-variant mb-1">اسم مقدم الطلب</p>
            <p className="font-bold">{requestData.applicantName}</p>
          </div>
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
            <p className="text-on-surface-variant mb-1">نوع الحالة</p>
            <p className="font-bold">{requestData.caseType}</p>
          </div>
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
            <p className="text-on-surface-variant mb-1">مرحلة التنفيذ</p>
            <StatusBadge>{requestData.lifecycleStatus}</StatusBadge>
          </div>
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
            <p className="text-on-surface-variant mb-1">قرار الحالة</p>
            <StatusBadge>{requestData.decisionStatus}</StatusBadge>
          </div>
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
            <p className="text-on-surface-variant mb-1">تاريخ التسجيل</p>
            <p className="font-bold">{new Date(requestData.createdAt).toLocaleDateString("ar-EG")}</p>
          </div>
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
            <p className="text-on-surface-variant mb-1">رقم التواصل</p>
            <p className="font-bold" dir="ltr">{requestData.phone || "غير متاح"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-12 rounded-3xl border border-outline-variant/30 shadow-sm max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <span className="material-symbols-outlined text-6xl text-primary mb-6">badge</span>
        <h2 className="text-3xl font-bold text-on-surface mb-4">نتيجة التحقق من العضوية</h2>
        <p className="text-lg text-on-surface-variant">
          الرقم القومي:
          <strong className="text-primary mr-2" dir="ltr">{memberData?.nationalId || id}</strong>
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
          <p className="text-on-surface-variant mb-1">اسم رب الأسرة</p>
          <p className="font-bold">{memberData?.headName}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
            <p className="text-on-surface-variant mb-1">الحالة</p>
            <StatusBadge>{memberData?.status}</StatusBadge>
          </div>
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
            <p className="text-on-surface-variant mb-1">المدينة</p>
            <p className="font-bold">{memberData?.city}</p>
          </div>
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
            <p className="text-on-surface-variant mb-1">الهاتف</p>
            <p className="font-bold" dir="ltr">{memberData?.phone || "غير متاح"}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
          <p className="font-bold mb-3">أحدث الحالات المرتبطة</p>
          {memberData?.recentCases.length ? (
            <div className="space-y-3">
              {memberData.recentCases.map((requestCase) => (
                <div
                  key={requestCase.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white border border-outline-variant/20 px-4 py-3"
                >
                  <div>
                    <p className="font-bold">{requestCase.caseType}</p>
                    <p className="text-xs text-on-surface-variant" dir="ltr">
                      {requestCase.id}
                    </p>
                  </div>
                  <StatusBadge>{requestCase.lifecycleStatus}</StatusBadge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">لا توجد حالات مرتبطة مسجلة حاليًا.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest font-body flex flex-col">
      <PublicHeader />
      <main className="flex-1 px-6 py-24">
        <Suspense fallback={<div className="text-center">جار التحميل...</div>}>
          <VerifyContent />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
