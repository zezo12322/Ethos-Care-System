"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import CaseIntakeForm from "@/components/dashboard/cases/CaseIntakeForm";
import { useAuth } from "@/contexts/AuthContext";
import { casesService, CreateCaseDto } from "@/services/cases.service";
import { useToast } from "@/components/ui/Toast";

export default function NewCasePage({
  searchParams,
}: {
  searchParams: Promise<{ familyId?: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  // الحالة تُسجَّل دائمًا من داخل ملف أسرة (لا أسرة = لا حالة)
  const familyId = use(searchParams).familyId;
  const isVolunteer = user?.role === "VOLUNTEER";

  useEffect(() => {
    if (user?.role === "CALL_CENTER") {
      router.replace(familyId ? `/dashboard/families/${familyId}` : "/dashboard/families");
    } else if (user && !familyId) {
      toast("أنشئ أو افتح ملف الأسرة أولًا ثم أضف الحالة من داخله.", "warning");
      router.replace(isVolunteer ? "/dashboard/families/new" : "/dashboard/families");
    }
  }, [user, router, familyId, toast, isVolunteer]);

  const handleSubmit = async (payload: CreateCaseDto) => {
    try {
      const createdCase = await casesService.create(payload);
      if (isVolunteer) {
        // المتطوع يبدأ الحالة التالية من تسجيل أسرتها
        toast("تم رفع الحالة للباحث بنجاح.", "success");
        router.push("/dashboard/families/new");
        return;
      }
      toast("تم تسجيل الحالة بنجاح.", "success");
      router.push(`/dashboard/cases/${createdCase.id}/edit`);
    } catch (error) {
      console.error(error);
      toast("حدث خطأ أثناء تسجيل الحالة.", "error");
      throw error;
    }
  };

  if (!familyId) return null;

  return (
    <div className="space-y-6">
      <CaseIntakeForm
        mode="create"
        initialFamilyId={familyId}
        currentUserName={user?.name ?? "مستخدم النظام"}
        currentUserRole={user?.role ?? "CASE_WORKER"}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
