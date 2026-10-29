"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { canVisit, homeFor } from "@/lib/roles";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function DashboardShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const allowed = canVisit(user?.role, pathname);

  // المتطوع والباحث يُعادان لصفحتهما لو فتحا صفحة خارج صلاحيتهما
  useEffect(() => {
    if (user && !allowed) router.replace(homeFor(user.role));
  }, [user, allowed, router]);

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <main className="flex min-h-screen flex-1 flex-col lg:mr-64">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:p-8">
          <Breadcrumbs />
          {allowed ? children : null}
        </div>
      </main>
    </div>
  );
}
