"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CaseIntakeForm from "@/components/dashboard/cases/CaseIntakeForm";
import { useAuth } from "@/contexts/AuthContext";
import { casesService, CreateCaseDto } from "@/services/cases.service";
import { CaseRecord } from "@/types/api";

export default function EditCasePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
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
          alert("تعذر تحميل بيانات الحالة.");
          router.push("/dashboard/cases");
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
  }, [id, router]);

  const handleSubmit = async (payload: CreateCaseDto) => {
    try {
      const updatedCase = await casesService.update(id, payload);
      setCaseRecord(updatedCase);
      alert("تم تحديث الحالة بنجاح.");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تعديل الحالة.");
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await casesService.remove(id);
      alert("تم حذف الحالة.");
      router.push("/dashboard/cases");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حذف الحالة.");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!caseRecord) {
    return null;
  }

  return (
    <div className="space-y-6">
      <CaseIntakeForm
        mode="edit"
        caseRecord={caseRecord}
        currentUserName={user?.name ?? "مستخدم النظام"}
        currentUserRole={user?.role ?? "CASE_WORKER"}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </div>
  );
}
