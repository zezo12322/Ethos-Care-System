import React from "react";
import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="bg-white border-b border-outline-variant/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="شعار صناع الحياة" className="w-16 h-16 object-contain" />
          <div className="flex flex-col">
            <span className="font-headline font-bold text-xl leading-none text-primary">صناع الحياة</span>
            <span className="text-[10px] text-on-surface-variant font-bold">بني سويف</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-on-surface font-semibold text-sm">
          <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <Link href="/about" className="hover:text-primary transition-colors">من نحن</Link>
          <Link href="/projects" className="hover:text-primary transition-colors">المشاريع والخدمات</Link>
          <Link href="/volunteer" className="hover:text-primary transition-colors">تطوع معنا</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">تواصل معنا</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="hidden lg:flex px-5 py-2.5 text-primary bg-primary/5 hover:bg-primary/10 rounded-xl font-bold text-sm transition-colors border border-primary/20"
          >
            دخول فريق العمل
          </Link>
          <Link 
            href="/request-aid" 
            className="px-6 py-2.5 bg-[#fcb900] text-on-surface hover:bg-[#e5a800] rounded-xl font-bold text-sm transition-colors shadow-sm"
          >
            ابدأ طلب مساعدة
          </Link>
        </div>
      </div>
    </header>
  );
}