"use client";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <span className="material-symbols-outlined text-6xl text-primary">
        cloud_off
      </span>
      <h1 className="text-2xl font-bold text-on-surface">
        لا يوجد اتصال بالإنترنت
      </h1>
      <p className="max-w-md text-on-surface-variant">
        أنت غير متصل حاليًا. يمكنك متابعة العمل على البيانات المحفوظة محليًا،
        وستتم المزامنة تلقائيًا بمجرد عودة الاتصال.
      </p>
    </main>
  );
}
