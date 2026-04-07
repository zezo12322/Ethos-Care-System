"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <main className="flex min-h-screen flex-1 flex-col lg:mr-64">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
