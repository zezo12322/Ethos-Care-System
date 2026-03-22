"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";

export default function CasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("الكل");
  const [filterStatus, setFilterStatus] = useState("الكل");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get('/cases').then(res => {
      setCases(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleExport = () => {
    const headers = "رقم الحالة,الاسم,النوع,الحالة,الأولوية,التاريخ,المكان\n";
    const csv = cases.map(c => `${c.id},${c.name},${c.type},${c.status},${c.priority},${c.date},${c.location}`).join("\n");
    const blob = new Blob(["\uFEFF" + headers + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `cases_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCases = cases.filter(c => {
    if (filterType !== "الكل" && c.type !== filterType) return false;
    if (filterStatus !== "الكل" && c.status !== filterStatus) return false;
    if (search && !c.name.includes(search) && !c.id.includes(search)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">إدارة الحالات والطلبات</h1>
          <p className="text-on-surface-variant mt-1 text-sm">متابعة وتحديث حالات المستفيدين والتدخلات المطلوبة</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="px-5 py-3 bg-surface-container-high text-on-surface rounded-xl font-bold flex items-center gap-2 hover:bg-surface-container-highest transition-all">
            <span className="material-symbols-outlined text-[20px]">download</span>
            تصدير البيانات
          </button>
          <Link href="/dashboard/cases/new" className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary-container transition-all shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[20px]">add</span>
            تسجيل طلب جديد
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex flex-wrap gap-4 items-center justify-between bg-surface-container-lowest/50">
           <div className="flex items-center gap-2 bg-white border border-outline-variant/50 rounded-xl px-3 py-2 w-full md:w-80 focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-outline">search</span>
            <input type="text" placeholder="بحث بالاسم أو رقم الحالة..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none w-full text-sm placeholder:text-outline" />
          </div>
          <div className="flex items-center gap-3">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-surface-container-lowest border border-outline-variant/50 text-sm rounded-lg px-3 py-2 outline-none focus:border-primary">
              <option value="الكل">جميع أنواع التدخل</option>
              <option value="تمكين اقتصادي">تمكين اقتصادي</option>
              <option value="تدخل طبي">تدخل طبي</option>
              <option value="سكن كريم">سكن كريم</option>
              <option value="تعليم">تعليم</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-surface-container-lowest border border-outline-variant/50 text-sm rounded-lg px-3 py-2 outline-none focus:border-primary">
              <option value="الكل">جميع الحالات</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="نشط">نشط</option>
              <option value="مكتمل">مكتمل</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-surface-container-lowest text-on-surface-variant text-sm border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4 font-bold">رقم الحالة / المستفيد</th>
                <th className="px-6 py-4 font-bold">نوع التدخل</th>
                <th className="px-6 py-4 font-bold">الأولوية</th>
                <th className="px-6 py-4 font-bold">تاريخ التسجيل</th>
                <th className="px-6 py-4 font-bold">المكان</th>
                <th className="px-6 py-4 font-bold">الحالة</th>
                <th className="px-6 py-4 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm font-medium">
              {loading ? (
                <tr><td colSpan={7} className="p-6 text-center text-outline">جارٍ التحميل...</td></tr>
              ) : filteredCases.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-outline">لا يوجد نتائج</td></tr>
              ) : (
                filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container-lowest/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-on-surface">{c.name}</p>
                    <p className="text-[11px] text-on-surface-variant font-mono mt-1">{c.id.substring(0,8)}</p>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{c.type}</td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                        c.priority === "عاجل" ? "text-red-600" :
                        c.priority === "عالي" ? "text-amber-600" :
                        "text-blue-600"
                     }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {c.priority}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{c.date}</td>
                  <td className="px-6 py-4 text-on-surface-variant max-w-[150px] truncate">{c.location}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                      c.status === "نشط" ? "bg-blue-100 text-blue-800" :
                      c.status === "مكتمل" ? "bg-green-100 text-green-800" :
                      c.status === "مرفوض" ? "bg-red-100 text-red-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
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
