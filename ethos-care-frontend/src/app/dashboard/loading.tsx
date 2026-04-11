export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-outline-variant/30 border-t-primary" />
        <p className="text-sm font-bold text-on-surface-variant">جاري التحميل...</p>
      </div>
    </div>
  );
}
