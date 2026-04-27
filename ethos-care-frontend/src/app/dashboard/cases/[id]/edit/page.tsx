"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CaseIntakeForm from "@/components/dashboard/cases/CaseIntakeForm";
import { useAuth } from "@/contexts/AuthContext";
import { casesService, CreateCaseDto } from "@/services/cases.service";
import { useToast } from "@/components/ui/Toast";
import { CaseRecord } from "@/types/api";

export default function EditCasePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "CALL_CENTER") {
      router.replace(`/dashboard/cases/${id}`);
      return;
    }
  }, [user, id, router]);

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
          toast("تعذر تحميل بيانات الحالة.", "error");
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
      toast("تم تحديث الحالة بنجاح.", "success");
    } catch (error) {
      console.error(error);
      toast("حدث خطأ أثناء تعديل الحالة.", "error");
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await casesService.remove(id);
      toast("تم حذف الحالة.", "success");
      router.push("/dashboard/cases");
    } catch (error) {
      console.error(error);
      toast("حدث خطأ أثناء حذف الحالة.", "error");
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
