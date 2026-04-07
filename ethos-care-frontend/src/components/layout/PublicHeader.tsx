"use client";

import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "الرئيسية" },
  { href: "/about", label: "من نحن" },
  { href: "/projects", label: "المشاريع والخدمات" },
  { href: "/volunteer", label: "تطوع معنا" },
  { href: "/contact", label: "تواصل معنا" },
];

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/20 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <Image
            src="/logo.png"
            alt="شعار صناع الحياة"
            width={64}
            height={64}
            className="mt-1 h-12 w-12 object-contain sm:h-16 sm:w-16"
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-headline text-base font-bold leading-none text-primary sm:text-xl">
              أجيال صناع الحياة
            </span>
            <span className="text-[10px] font-bold text-on-surface-variant sm:text-xs">
              ببني سويف
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-on-surface lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/login"
            className="hidden rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/10 lg:inline-flex"
          >
            دخول فريق العمل
          </Link>
          <Link
            href="/request-aid"
            className="rounded-xl bg-[#fcb900] px-4 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-[#e5a800] sm:px-5"
          >
            ابدأ طلب مساعدة
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-container-low text-on-surface lg:hidden"
          aria-label="فتح القائمة"
        >
          <span className="material-symbols-outlined">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-outline-variant/20 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl space-y-2 px-4 py-4 sm:px-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface"
              >
                {item.label}
              </Link>
            ))}
            <div className="grid gap-2 pt-2 sm:grid-cols-2">
              <Link
                href="/request-aid"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl bg-[#fcb900] px-4 py-3 text-center text-sm font-bold text-on-surface"
              >
                ابدأ طلب مساعدة
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-center text-sm font-bold text-primary"
              >
                دخول فريق العمل
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
