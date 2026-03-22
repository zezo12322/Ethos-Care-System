"use client";

import React from "react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">مركز التقارير والإحصائيات</h1>
          <p className="text-on-surface-variant mt-1 text-sm">استخراج بيانات وتقارير تفصيلية عن أنشطة وحالات الجمعية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "التقرير الشهري الشامل", desc: "ملخص جميع الأنشطة والحالات خلال شهر محدد", icon: "calendar_month", color: "text-blue-600", bg: "bg-blue-100" },
          { title: "تقرير التدخلات الطبية", desc: "إحصائيات القوافل والعمليات والأدوية وتكاليفها", icon: "medical_services", color: "text-red-600", bg: "bg-red-100" },
          { title: "تقرير التمكين الاقتصادي", desc: "المشاريع الصغيرة المسلمة ونسب نجاحها والتسديد", icon: "trending_up", color: "text-green-600", bg: "bg-green-100" },
          { title: "سجل المتطوعين", desc: "ساعات التطوع، الحملات المشارك بها لكل متطوع", icon: "volunteer_activism", color: "text-purple-600", bg: "bg-purple-100" },
        ].map((report, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-outline-variant/30 hover:border-primary/50 transition-colors cursor-pointer group">
            <div className={`w-14 h-14 rounded-2xl ${report.bg} ${report.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined text-3xl">{report.icon}</span>
            </div>
            <h3 className="text-lg font-bold font-headline mb-2">{report.title}</h3>
            <p className="text-sm text-on-surface-variant mb-6">{report.desc}</p>
            <button className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              استخراج التقرير <span className="material-symbols-outlined text-[16px] rtl:rotate-180">arrow_forward</span>
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-outline-variant/30 mt-8">
        <h2 className="text-xl font-bold font-headline mb-6">تقرير مخصص</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold mb-2">نوع البيانات</label>
            <select className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary">
              <option>جميع الحالات</option>
              <option>الأسر المستفيدة فقط</option>
              <option>التبرعات العينية</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">من تاريخ</label>
            <input type="date" className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary" />
          </div>
          <div>
             <label className="block text-sm font-bold mb-2">إلى تاريخ</label>
            <input type="date" className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary" />
          </div>
        </div>
        <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-container transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined">download</span>
          تصدير إلى Excel
        </button>
      </div>
    </div>
  );
}
