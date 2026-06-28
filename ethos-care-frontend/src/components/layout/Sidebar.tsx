"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  href: string;
  icon: string;
  label: string;
  roles: string[];
}

const ALL_STAFF = [
  "ADMIN",
  "CEO",
  "MANAGER",
  "CASE_WORKER",
  "DATA_ENTRY",
  "EXECUTION_OFFICER",
  "CALL_CENTER",
];

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", icon: "dashboard", label: "الرئيسية", roles: ALL_STAFF },
  {
    href: "/dashboard/operations",
    icon: "settings_accessibility",
    label: "العمليات",
    roles: ["ADMIN", "MANAGER", "EXECUTION_OFFICER", "CEO", "CASE_WORKER", "DATA_ENTRY"],
  },
  { href: "/dashboard/cases", icon: "folder_shared", label: "الحالات", roles: ALL_STAFF },
  { href: "/dashboard/families", icon: "family_restroom", label: "الأسر", roles: ALL_STAFF },
  { href: "/dashboard/search", icon: "search", label: "البحث", roles: ALL_STAFF },
  {
    href: "/dashboard/reports",
    icon: "table_view",
    label: "الاستخراجات",
    roles: ["ADMIN", "CEO", "MANAGER", "EXECUTION_OFFICER"],
  },
  { href: "/dashboard/cms", icon: "edit_note", label: "محتوى الموقع", roles: ["ADMIN", "CEO"] },
  { href: "/dashboard/partners", icon: "handshake", label: "الشركاء", roles: ["ADMIN", "CEO"] },
  { href: "/dashboard/news", icon: "newspaper", label: "الأخبار", roles: ["ADMIN", "CEO"] },
  {
    href: "/dashboard/locations",
    icon: "location_on",
    label: "النطاق الجغرافي",
    roles: ["ADMIN", "CEO", "MANAGER", "CASE_WORKER", "EXECUTION_OFFICER"],
  },
];

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const userRole = user?.role || "CASE_WORKER";

  const isAuthorized = (allowedRoles: string[]) => allowedRoles.includes(userRole);

  // الصفحة الحالية: مطابقة تامة للرئيسية، وبادئة لباقي الأقسام (تشمل الصفحات الفرعية)
  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) =>
    `group flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
      isActive(href)
        ? "bg-white/15 text-white font-semibold"
        : "text-white/70 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <>
      <button
        type="button"
        aria-label="إغلاق القائمة"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity lg:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-label="القائمة الرئيسية"
        className={`fixed right-0 top-0 z-50 flex h-screen w-[88vw] max-w-xs flex-col overflow-y-auto bg-primary p-4 text-right font-headline antialiased shadow-[0px_12px_32px_-4px_rgba(0,40,38,0.06)] transition-transform duration-300 lg:w-64 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <span className="text-sm font-bold text-white/80">القائمة</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="mb-2 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="شعار صناع الحياة"
              width={80}
              height={80}
              className="h-20 w-20 object-contain brightness-0 invert"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">صناع الحياة</h2>
          <p className="text-xs text-white/60">لوحة التحكم الإدارية</p>
        </div>

        <nav className="space-y-2" aria-label="التنقّل">
          {NAV_ITEMS.filter((item) => isAuthorized(item.roles)).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={linkClass(item.href)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}

          {isAuthorized(["ADMIN", "CEO"]) && (
            <div className="mt-6 space-y-2 border-t border-white/10 pt-6">
              <Link
                href="/dashboard/admin"
                onClick={onClose}
                aria-current={isActive("/dashboard/admin") ? "page" : undefined}
                className={linkClass("/dashboard/admin")}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  admin_panel_settings
                </span>
                <span>{userRole === "CEO" ? "الإدارة التنفيذية" : "الإدارة"}</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Logout button */}
        <div className="mt-4 border-t border-white/10 pt-4">
          <button
            onClick={() => {
              import("js-cookie").then((Cookies) => {
                Cookies.default.remove("access_token");
                window.location.href = "/login";
              });
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-300 transition-colors hover:bg-red-900/20 hover:text-red-200"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              logout
            </span>
            <span>تسجيل خروج</span>
          </button>
        </div>

        {/* Bottom version badge inside sidebar */}
        <div className="mt-auto pb-4 pt-8 text-center">
          <p className="text-[10px] uppercase tracking-widest text-white/55">Version 1.0.0</p>
        </div>
      </aside>
    </>
  );
}
