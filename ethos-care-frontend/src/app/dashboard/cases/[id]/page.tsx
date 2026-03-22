"use client";

import Link from "next/link";
import React from "react";

export default function CaseDetailsPage({ params }: { params: { id: string } }) {
  // Using a mock ID just for presentation since param might be a placeholder
  const caseId = params.id || "C-2024-001";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cases" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-outline-variant/30 hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined rtl:rotate-180">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold font-headline text-on-surface">محمد رمضان أحمد</h1>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold font-body">نشط</span>
            </div>
            <p className="text-sm text-on-surface-variant font-bold tracking-widest" dir="ltr">{caseId}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-outline-variant/50 hover:bg-surface-container-lowest rounded-xl font-bold text-sm text-primary flex items-center gap-2 transition-colors">
             <span className="material-symbols-outlined text-[18px]">edit</span>
             تعديل
           </button>
           <button className="px-4 py-2 bg-primary text-white hover:bg-primary-container rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-md">
             <span className="material-symbols-outlined text-[18px]">gavel</span>
             اتخاذ قرار
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-outline-variant/30 p-6 shadow-sm">
            <h2 className="text-lg font-bold font-headline mb-6 border-b border-outline-variant/30 pb-3">تفاصيل الطلب</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 mb-6">
              <div>
                <p className="text-xs text-on-surface-variant mb-1">نوع التدخل</p>
                <div className="font-bold flex items-center gap-1"><span className="material-symbols-outlined text-primary text-[18px]">trending_up</span> تمكين اقتصادي</div>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">تاريخ التسجيل</p>
                <div className="font-bold" dir="ltr">2024-10-25</div>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">الأولوية</p>
                <div className="font-bold text-red-600 flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">error</span> عاجل</div>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">الباحث المسؤول</p>
                <div className="font-bold">سارة محمود</div>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">رقم التليفون للتواصل</p>
                <div className="font-bold" dir="ltr">01099887766</div>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 mb-6">
               <h3 className="font-bold text-sm mb-2 text-primary">وصف الحالة</h3>
               <p className="text-sm leading-relaxed text-on-surface-variant">حالة الشاب محمد رمضان يحتاج إلى ماكينة خياطة ليبدأ مشروعاً صغيراً يعيل به أسرته المكونة من 5 أفراد، بعد تعرضه لحادث أقعده عن العمل في المعمار. تم إجراء بحث ميداني وتبين استحقاقه الفوري للدعم.</p>
            </div>

            <h3 className="font-bold text-sm mb-3">المرفقات (3)</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              <div className="flex-shrink-0 w-32 h-24 bg-surface-container-highest rounded-xl flex flex-col items-center justify-center border border-outline-variant/50 cursor-pointer hover:bg-outline-variant/20 transition-colors">
                <span className="material-symbols-outlined text-outline text-2xl mb-1">description</span>
                <span className="text-[10px] font-bold">صورة البطاقة</span>
              </div>
              <div className="flex-shrink-0 w-32 h-24 bg-surface-container-highest rounded-xl flex flex-col items-center justify-center border border-outline-variant/50 cursor-pointer hover:bg-outline-variant/20 transition-colors">
                <span className="material-symbols-outlined text-outline text-2xl mb-1">description</span>
                <span className="text-[10px] font-bold">بحث الحالة</span>
              </div>
              <div className="flex-shrink-0 w-32 h-24 bg-surface-container-highest rounded-xl flex flex-col items-center justify-center border border-outline-variant/50 cursor-pointer hover:bg-outline-variant/20 transition-colors">
                <span className="material-symbols-outlined text-outline text-2xl mb-1">image</span>
                <span className="text-[10px] font-bold">صورة المنزل</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-outline-variant/30 p-6 shadow-sm">
             <h2 className="text-lg font-bold font-headline mb-6 border-b border-outline-variant/30 pb-3">تحديثات وسجل الحالة</h2>
             <div className="space-y-6">
                <div className="flex gap-4 relative">
                  <div className="w-[2px] bg-primary absolute right-[11px] top-[24px] bottom-[-24px]"></div>
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 z-10">
                    <span className="material-symbols-outlined text-[12px]">done</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">البدء في التسليم</h4>
                    <p className="text-xs text-on-surface-variant my-1">تمت الموافقة من لجنة الإدارة وجاري شراء الماكينة.</p>
                    <span className="text-[10px] text-outline font-bold">اليوم، 10:30 صباحاً</span>
                  </div>
                </div>
                
                <div className="flex gap-4 relative">
                  <div className="w-[2px] bg-outline-variant/50 absolute right-[11px] top-[24px] bottom-[-24px]"></div>
                  <div className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-primary text-primary flex items-center justify-center flex-shrink-0 z-10">
                    <span className="material-symbols-outlined text-[12px]">search</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">الزيارة الميدانية</h4>
                    <p className="text-xs text-on-surface-variant my-1">قامت سارة محمود بإجراء الزيارة الميدانية ورفع التقرير.</p>
                    <span className="text-[10px] text-outline font-bold">24 أكتوبر، 02:15 مساءً</span>
                  </div>
                </div>

                <div className="flex gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-outline flex items-center justify-center flex-shrink-0 z-10">
                    <span className="material-symbols-outlined text-[12px]">add</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">تسجيل مبدئي</h4>
                    <p className="text-xs text-on-surface-variant my-1">تم إدخال الحالة للنظام من قبل أحمد محمد.</p>
                    <span className="text-[10px] text-outline font-bold">20 أكتوبر، 09:00 صباحاً</span>
                  </div>
                </div>
             </div>
             <div className="mt-6 flex gap-2">
               <input type="text" placeholder="اكتب تحديثاً أو ملاحظة..." className="flex-1 bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 text-sm outline-none" />
               <button className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20">إرسال</button>
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-sm">
             <h3 className="font-bold font-headline mb-4 flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">family_restroom</span>
               بيانات الأسرة المرتبطة
             </h3>
             <div className="bg-white rounded-2xl p-4 border border-outline-variant/30 mb-4">
               <h4 className="font-bold text-primary mb-1">عائلة / محمود رمضان</h4>
               <p className="text-xs text-on-surface-variant mb-3 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> بني سويف - ببا</p>
               <div className="flex justify-between text-xs font-bold pt-3 border-t border-outline-variant/20">
                 <span>الأفراد: 5</span>
                 <span>الدخل: ضعيف</span>
               </div>
             </div>
             <Link href="/dashboard/families/F-2024-001" className="w-full py-2 bg-white border border-primary/30 text-primary hover:bg-primary/5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-colors">
               عرض ملف الأسرة <span className="material-symbols-outlined text-[16px] rtl:rotate-180">arrow_forward</span>
             </Link>
          </div>

          <div className="bg-[#fcb900]/10 rounded-3xl border border-[#fcb900]/30 p-6 shadow-sm">
             <h3 className="font-bold font-headline text-[#8a6500] mb-2 flex items-center gap-2">
               <span className="material-symbols-outlined">warning</span>
               مؤشرات هامة
             </h3>
             <ul className="space-y-2 text-sm text-[#8a6500] font-medium list-disc list-inside px-2">
               <span>عائل الأسرة غير قادر على العمل بدنياً.</span><br/>
               <span>يوجد طفلان في مراحل تعليمية حرجة.</span>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
