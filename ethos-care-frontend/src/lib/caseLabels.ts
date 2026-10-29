// تسميات وألوان مراحل وأولويات الحالات — مشتركة بين شاشات الأسر وملف الأسرة

export const LIFECYCLE: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "مع الباحث", color: "bg-surface-container text-on-surface-variant" },
  REVIEW: { label: "بانتظار قرار المدير", color: "bg-warning/15 text-warning" },
  APPROVED: { label: "معتمدة", color: "bg-success/15 text-success" },
  EXECUTION: { label: "تنفيذ", color: "bg-primary/15 text-primary" },
  COMPLETED: { label: "مكتمل", color: "bg-success text-on-success" },
  REJECTED: { label: "مرفوضة", color: "bg-error/15 text-error" },
  FIELD_VERIFICATION: { label: "تحقق ميداني (قديم)", color: "bg-warning/15 text-warning" },
  // مراحل قديمة قبل توحيد دورة الحالة
  INTAKE_REVIEW: { label: "مراجعة (قديم)", color: "bg-warning/15 text-warning" },
  COMMITTEE_REVIEW: { label: "لجنة (قديم)", color: "bg-warning/15 text-warning" },
  IN_PROGRESS: { label: "تنفيذ (قديم)", color: "bg-primary/15 text-primary" },
  TECH_REJECTED: { label: "مرفوض فنياً (قديم)", color: "bg-error/15 text-error" },
  ON_HOLD: { label: "معلق (قديم)", color: "bg-surface-variant text-on-surface-variant" },
  ARCHIVED: { label: "مؤرشف (قديم)", color: "bg-surface-container text-on-surface-variant" },
};

// المراحل الحالية بالترتيب — للفلاتر
export const ACTIVE_STAGES = ["DRAFT", "REVIEW", "APPROVED", "EXECUTION", "COMPLETED", "REJECTED"];

// لون صف الحالة عند المدير بحسب الأولوية: عادي أبيض، عالي أصفر، عاجل أحمر
export const PRIORITY_ROW: Record<string, string> = {
  NORMAL: "border-outline-variant/30 bg-white",
  HIGH: "border-warning/40 bg-warning/10",
  URGENT: "border-error/40 bg-error/10",
};

// يطابق CLOSED_LIFECYCLES في stats.service بالـ backend
export const CLOSED_STAGES = ["COMPLETED", "REJECTED", "TECH_REJECTED"];
export const isOpenCase = (c: { lifecycleStatus: string }) => !CLOSED_STAGES.includes(c.lifecycleStatus);

export const PRIORITY: Record<string, { label: string; color: string }> = {
  URGENT: { label: "عاجل", color: "bg-error/10 text-error" },
  HIGH: { label: "عالي", color: "bg-warning/10 text-warning" },
  NORMAL: { label: "عادي", color: "bg-surface-container text-on-surface-variant" },
};

export const lifecycleOf = (status: string) =>
  LIFECYCLE[status] ?? { label: status, color: "bg-surface-container text-on-surface-variant" };
export const priorityOf = (priority: string) => PRIORITY[priority] ?? PRIORITY.NORMAL;

export const STALE_DAYS = 7;
export const isStale = (c: { lifecycleStatus: string; lastActionAt?: string }) =>
  isOpenCase(c) &&
  !!c.lastActionAt &&
  Date.now() - new Date(c.lastActionAt).getTime() > STALE_DAYS * 86_400_000;

// قرارات المدير في سجل الحالة — «رأي المدير» هو آخر قرار منها مع تعليقه
export const DIRECTOR_ACTIONS: Record<string, string> = {
  approve: "اعتماد",
  reject: "رفض",
  return_to_draft: "إعادة للباحث",
};
export const latestDirectorOpinion = <T extends { action: string; performedAt: string }>(
  history: T[] = [],
) =>
  history
    .filter((h) => h.action in DIRECTOR_ACTIONS)
    .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())[0];

// وصف حركة من سجل الحالة (CaseHistory)
export const historyText = (h: { action: string; toLifecycleStatus: string }) =>
  h.action.startsWith("CREATED")
    ? "سجّل الحالة"
    : `نقل الحالة إلى «${lifecycleOf(h.toLifecycleStatus).label}»`;

const rtf = new Intl.RelativeTimeFormat("ar-EG", { numeric: "auto" });
export const ago = (iso: string, now = Date.now()) => {
  const sec = Math.round((new Date(iso).getTime() - now) / 1000);
  if (sec > -60) return rtf.format(sec, "second");
  if (sec > -3600) return rtf.format(Math.round(sec / 60), "minute");
  if (sec > -86400) return rtf.format(Math.round(sec / 3600), "hour");
  return rtf.format(Math.round(sec / 86400), "day");
};
