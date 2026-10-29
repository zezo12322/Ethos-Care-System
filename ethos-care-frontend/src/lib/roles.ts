// صلاحيات التنقل بحسب الدور
//  المتطوع: ينشئ ملف الأسرة ثم يرفع حالتها — بلا لوحة تحكم
//  الباحث: الأسر وصفحات حالاتها فقط
//  المدير (ADMIN/CEO) وخدمة المستفيدين: باقي الصفحات حسب القائمة الجانبية
export const DIRECTOR_ROLES = ["ADMIN", "CEO"];
export const isDirector = (role?: string) => DIRECTOR_ROLES.includes(role ?? "");

export const homeFor = (role?: string) =>
  role === "VOLUNTEER"
    ? "/dashboard/families/new"
    : role === "CASE_WORKER"
      ? "/dashboard/families"
      : "/dashboard";

const ALLOWED_PREFIXES: Record<string, string[]> = {
  VOLUNTEER: ["/dashboard/families/new", "/dashboard/cases/new", "/dashboard/profile"],
  CASE_WORKER: ["/dashboard/families", "/dashboard/cases", "/dashboard/profile"],
};

export const canVisit = (role: string | undefined, path: string) => {
  const allowed = ALLOWED_PREFIXES[role ?? ""];
  return !allowed || allowed.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
};
