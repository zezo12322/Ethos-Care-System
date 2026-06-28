"use client";

import { useAuth } from "@/contexts/AuthContext";

const getGreetingPrefix = (hour: number) => {
  if (hour < 12) return "صباح الخير";
  if (hour < 17) return "نهارك سعيد";
  return "مساء الخير";
};

export default function DashboardGreeting() {
  const { user } = useAuth();
  const firstName = user?.name?.trim().split(/\s+/)[0];

  // يُحسب وقت الإظهار؛ نُسكِت تحذير الـ hydration لأن وقت الخادم قد يختلف
  // عن وقت المتصفح (منطقة زمنية) — والقيمة النهائية الصحيحة هي وقت المتصفح.
  const now = new Date();
  const greeting = getGreetingPrefix(now.getHours());
  const today = now.toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-1">
      <p
        className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant"
        suppressHydrationWarning
      >
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
          calendar_today
        </span>
        {today}
      </p>
      <h1
        className="text-2xl font-extrabold text-on-surface sm:text-[28px]"
        suppressHydrationWarning
      >
        {firstName ? `${greeting}، ${firstName}` : `${greeting} بك`}
      </h1>
      <p className="text-sm text-on-surface-variant">
        دي نظرة سريعة على الحالات والأسر والعمليات — وتقدر تبحث عن أي مستفيد فورًا.
      </p>
    </div>
  );
}
