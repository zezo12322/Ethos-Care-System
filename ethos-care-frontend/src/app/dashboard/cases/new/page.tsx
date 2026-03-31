"use client";

import { useRouter } from "next/navigation";
import CaseIntakeForm from "@/components/dashboard/cases/CaseIntakeForm";
import { useAuth } from "@/contexts/AuthContext";
import { casesService, CreateCaseDto } from "@/services/cases.service";

export default function NewCasePage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (payload: CreateCaseDto) => {
    try {
      const createdCase = await casesService.create(payload);
      alert("تم تسجيل الحالة بنجاح.");
      router.push(`/dashboard/cases/${createdCase.id}/edit`);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تسجيل الحالة.");
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <CaseIntakeForm
        mode="create"
        currentUserName={user?.name ?? "مستخدم النظام"}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
