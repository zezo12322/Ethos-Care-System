"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">البحث المتقدم</h1>
          <p className="text-on-surface-variant mt-1 text-sm">البحث الشامل في جميع قواعد بيانات النظام</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10"></div>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="relative">
             <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary text-3xl">search</span>
             <input 
               type="text" 
               placeholder="قم بالبحث باستخدام الرقم القومي، رقم الملف، اسم المستفيد، أو رقم التليفون..."
               className="w-full bg-surface-container-lowest border-2 border-outline-variant/50 focus:border-primary rounded-2xl py-5 pr-16 pl-4 text-lg font-bold outline-none transition-all shadow-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <button className="absolute left-3 top-1/2 -translate-y-1/2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-container transition-colors">
               بحث
             </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="text-on-surface-variant">خيارات سريعة:</span>
            <span className="px-3 py-1 bg-surface-container-low rounded-full cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">حالات التدخل الطبي</span>
            <span className="px-3 py-1 bg-surface-container-low rounded-full cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">المرفوضين آخر شهر</span>
            <span className="px-3 py-1 bg-surface-container-low rounded-full cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">قرية بياض العرب</span>
          </div>
        </div>
      </div>

      {/* Mock Search Results (Shown only if typing) */}
      {searchTerm && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="font-bold text-lg border-b border-outline-variant/30 pb-2">نتائج البحث ({searchTerm})</h3>
          
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20">
             <Link href="/dashboard/cases/C-2024-001" className="flex items-center gap-4 p-4 hover:bg-surface-container-lowest transition-colors group">
               <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                 <span className="material-symbols-outlined">folder_shared</span>
               </div>
               <div className="flex-1">
                 <h4 className="font-bold text-lg">محمد رمضان أحمد <span className="text-sm font-normal text-on-surface-variant ml-2">(حالة)</span></h4>
                 <p className="text-sm text-on-surface-variant flex gap-4">
                   <span>رقم الملف: C-2024-001</span>
                   <span>تمكين اقتصادي</span>
                 </p>
               </div>
               <span className="material-symbols-outlined text-outline rtl:rotate-180">chevron_right</span>
             </Link>
             
             <Link href="/dashboard/families/F-2024-101" className="flex items-center gap-4 p-4 hover:bg-surface-container-lowest transition-colors group">
               <div className="w-12 h-12 rounded-xl bg-[#fcb900]/20 text-[#bf8c00] flex items-center justify-center group-hover:scale-110 transition-transform">
                 <span className="material-symbols-outlined">family_restroom</span>
               </div>
               <div className="flex-1">
                 <h4 className="font-bold text-lg">أسرة / محمود عبدالرحمن السيد <span className="text-sm font-normal text-on-surface-variant ml-2">(أسرة)</span></h4>
                 <p className="text-sm text-on-surface-variant flex gap-4">
                   <span>قرية باروط - بني سويف</span>
                   <span>5 أفراد</span>
                 </p>
               </div>
               <span className="material-symbols-outlined text-outline rtl:rotate-180">chevron_right</span>
             </Link>
          </div>
        </div>
      )}
    </div>
  );
}
