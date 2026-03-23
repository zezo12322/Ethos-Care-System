"use client";

import React, { Suspense } from "react";
import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";
import { useSearchParams } from "next/navigation";

function VerifyContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  return (
    <div className="bg-white p-12 rounded-3xl border border-outline-variant/30 shadow-sm text-center max-w-2xl mx-auto">
      <span className="material-symbols-outlined text-6xl text-primary mb-6">verified</span>
      <h2 className="text-3xl font-bold text-on-surface mb-4">نتيجة التحقق</h2>
      <p className="text-lg text-on-surface-variant mb-6">
        {type === "member" ? "تم البحث عن العضوية بالرقم القومي: " : "تم البحث عن الطلب برقم: "}
        <strong className="text-primary" dir="ltr">{id}</strong>
      </p>
      <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/50">
        <p className="font-bold text-on-surface">لم يتم العثور على نتائج متطابقة في النظام حالياً.</p>
        <p className="text-sm text-on-surface-variant mt-2">يرجى التأكد من الرقم المدخل أو التواصل مع الدعم الفني.</p>
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
