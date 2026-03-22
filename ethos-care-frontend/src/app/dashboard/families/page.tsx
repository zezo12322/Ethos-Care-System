"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";

export default function FamiliesPage() {
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/families').then(res => {
      setFamilies(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">إدارة ملفات الأسر</h1>
          <p className="text-on-surface-variant mt-1 text-sm">أرشفة وتقييم بيانات الأسر المستحقة بقرى ومراكز בני سويف</p>
        </div>
        <Link href="/dashboard/families/new" className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-all shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined">add</span>
          إضافة ملف أسرة
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex flex-wrap gap-4 items-center justify-between bg-surface-container-lowest/50">
           <div className="flex items-center gap-2 bg-white border border-outline-variant/50 rounded-xl px-3 py-2 w-full md:w-96 focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-outline">search</span>
            <input type="text" placeholder="بحث بالاسم أو الرقم القومي..." className="bg-transparent border-none outline-none w-full text-sm placeholder:text-outline" />
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
            تصفية متقدمة
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-surface-container-lowest text-on-surface-variant text-sm border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4 font-bold">اسم العائل / رقم الملف</th>
                <th className="px-6 py-4 font-bold">أفراد الأسرة</th>
                <th className="px-6 py-4 font-bold">متوسط الدخل</th>
                <th className="px-6 py-4 font-bold">العنوان</th>
                <th className="px-6 py-4 font-bold">آخر زيارة</th>
                <th className="px-6 py-4 font-bold">حالة التقييم</th>
                <th className="px-6 py-4 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm font-medium">
              {loading ? (
                <tr><td colSpan={7} className="p-6 text-center text-outline">جارٍ التحميل...</td></tr>
              ) : families.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-outline">لا يوجد أسر مسجلة حالياً</td></tr>
              ) : (
                families.map((family) => (
                <tr key={family.id} className="hover:bg-surface-container-lowest/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-on-surface">{family.headName}</p>
                    <p className="text-xs text-on-surface-variant font-mono mt-1">{family.id}</p>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-lg text-xs font-bold text-on-surface">
                        <span className="material-symbols-outlined text-[14px]">groups</span>
                        {family.membersCount} أفراد
                     </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{family.income}</td>
                  <td className="px-6 py-4 text-on-surface-variant max-w-[200px] truncate">{family.address}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{family.lastVisit}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      family.status === "مستحق" ? "bg-green-100 text-green-800" :
                      family.status === "غير مستحق" ? "bg-red-100 text-red-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {family.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                       </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
