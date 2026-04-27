"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CaseIntakeForm from "@/components/dashboard/cases/CaseIntakeForm";
import { useAuth } from "@/contexts/AuthContext";
import { casesService, CreateCaseDto } from "@/services/cases.service";
import { useToast } from "@/components/ui/Toast";

export default function NewCasePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.role === "CALL_CENTER") {
      router.replace("/dashboard/cases");
    }
  }, [user, router]);

  const handleSubmit = async (payload: CreateCaseDto) => {
    try {
      const createdCase = await casesService.create(payload);
      toast("تم تسجيل الحالة بنجاح.", "success");
      router.push(`/dashboard/cases/${createdCase.id}/edit`);
    } catch (error) {
      console.error(error);
      toast("حدث خطأ أثناء تسجيل الحالة.", "error");
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <CaseIntakeForm
        mode="create"
        currentUserName={user?.name ?? "مستخدم النظام"}
        currentUserRole={user?.role ?? "CASE_WORKER"}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
