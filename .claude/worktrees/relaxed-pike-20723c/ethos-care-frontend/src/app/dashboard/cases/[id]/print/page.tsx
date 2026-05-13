"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import CasePrintView from "@/components/dashboard/cases/CasePrintView";
import { casesService } from "@/services/cases.service";
import { CaseRecord } from "@/types/api";
import { useToast } from "@/components/ui/Toast";

export default function CasePrintPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCase = async () => {
      try {
        setLoading(true);
        const response = await casesService.getById(id);
        if (!cancelled) {
          setCaseRecord(response);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          toast("تعذر تحميل تقرير الحالة.", "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCase();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!caseRecord) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-6">
        <div className="rounded-3xl border border-outline-variant/30 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-on-surface">تعذر فتح بيان الحالة</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            لم يتم العثور على الحالة المطلوبة أو حدث خطأ أثناء التحميل.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface print:bg-white">
      <div className="print-hidden sticky top-0 z-20 border-b border-outline-variant/30 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-on-surface">بيان الحالة</h1>
            <p className="text-sm text-on-surface-variant">
              افتح نافذة الطباعة واحفظها PDF إذا أردت نسخة قابلة للمشاركة.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20"
            >
              طباعة / حفظ PDF
            </button>
            <Link
              href={`/dashboard/cases/${caseRecord.id}/edit`}
              className="rounded-2xl bg-tertiary/10 px-5 py-3 text-sm font-bold text-tertiary"
            >
              تعديل الكارت
            </Link>
            <Link
              href={`/dashboard/cases/${caseRecord.id}`}
              className="rounded-2xl bg-surface-container-low px-5 py-3 text-sm font-bold text-on-surface"
            >
              العودة للتفاصيل
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8 print:max-w-none print:px-0 print:py-0">
        <CasePrintView caseRecord={caseRecord} />
      </main>
    </div>
  );
}
