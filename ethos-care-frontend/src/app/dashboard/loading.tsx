export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="جاري التحميل">
      {/* عنوان الصفحة */}
      <div className="h-9 w-60 animate-pulse rounded-2xl bg-surface-container-high" />

      {/* كروت إحصائية */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-3xl border border-outline-variant/20 bg-surface-container-low"
          />
        ))}
      </div>

      {/* بطاقة محتوى رئيسية (جدول/قائمة) */}
      <div className="space-y-4 rounded-3xl border border-outline-variant/20 bg-white p-6">
        <div className="h-6 w-40 animate-pulse rounded-xl bg-surface-container-high" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-2xl bg-surface-container-low"
          />
        ))}
      </div>

      <span className="sr-only">جاري تحميل المحتوى...</span>
    </div>
  );
}
