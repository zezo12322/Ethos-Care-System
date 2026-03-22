"use client";

import Link from "next/link";
import React, { useState, useEffect, use } from "react";
import api from "@/lib/api";

export default function FamilyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  
  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { id: familyId } = use(params);

  useEffect(() => {
    api.get(`/families/${familyId}`).then(res => {
      setFamily(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [familyId]);

  if (loading) return <div className="p-8 text-center">جاري تحميل بيانات الأسرة...</div>;
  if (!family) return <div className="p-8 text-center text-red-500">حدث خطأ أو لم يتم العثور على الأسرة</div>;


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/families" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-outline-variant/30 hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined rtl:rotate-180">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold font-headline text-on-surface">أسرة / {family.headName || "بدون اسم"}</h1>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold font-body">مستحق</span>
            </div>
            <p className="text-sm text-on-surface-variant font-bold tracking-widest" dir="ltr">{family.id || familyId}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-outline-variant/50 hover:bg-surface-container-lowest rounded-xl font-bold text-sm text-primary flex items-center gap-2 transition-colors">
             <span className="material-symbols-outlined text-[18px]">edit</span>
             تعديل الملف
           </button>
           <button className="px-4 py-2 bg-primary text-white hover:bg-primary-container rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-md">
             <span className="material-symbols-outlined text-[18px]">add</span>
             إضافة حالة (طلب جديد)
           </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">حجم الأسرة</p>
            <p className="text-xl font-bold">{family.membersCount || 2} أفراد</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">الدخل التقريبي</p>
            <p className="text-xl font-bold" dir="ltr">1200 EGP</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-4 flex items-center gap-4 border-b-4 border-b-[#fcb900]">
          <div className="w-12 h-12 rounded-xl bg-[#fcb900]/10 text-[#a37600] flex items-center justify-center">
            <span className="material-symbols-outlined">star</span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">مستوى الحاجة (تقييم النظام)</p>
            <p className="text-xl font-bold text-[#a37600]">مرتفع جداً</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined">verified_user</span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant">آخر تحديث للبحث</p>
            <p className="text-sm font-bold mt-1" dir="ltr">15 أكتوبر 2024</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Members Table */}
          <div className="bg-white rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm">
             <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
               <h2 className="font-bold font-headline">أفراد الأسرة</h2>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-surface-container-lowest border-b border-outline-variant/30 text-on-surface-variant font-bold">
                    <tr>
                      <th className="px-5 py-3">الاسم</th>
                      <th className="px-5 py-3">صلة القرابة</th>
                      <th className="px-5 py-3 text-center">السن</th>
                      <th className="px-5 py-3">المرحلة الدراسية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    <tr className="hover:bg-surface-container-lowest/50">
                      <td className="px-5 py-3 font-bold">زينب علي حسن</td>
                      <td className="px-5 py-3">زوجة</td>
                      <td className="px-5 py-3 text-center">38</td>
                      <td className="px-5 py-3">لا تدرس</td>
                    </tr>
                    <tr className="hover:bg-surface-container-lowest/50">
                      <td className="px-5 py-3 font-bold">أحمد محمود عبدالرحمن</td>
                      <td className="px-5 py-3">ابن</td>
                      <td className="px-5 py-3 text-center">15</td>
                      <td className="px-5 py-3">إعدادي</td>
                    </tr>
                    <tr className="hover:bg-surface-container-lowest/50">
                      <td className="px-5 py-3 font-bold">فاطمة محمود عبدالرحمن</td>
                      <td className="px-5 py-3">ابنة</td>
                      <td className="px-5 py-3 text-center">12</td>
                      <td className="px-5 py-3">ابتدائي</td>
                    </tr>
                    <tr className="hover:bg-surface-container-lowest/50">
                      <td className="px-5 py-3 font-bold">يوسف محمود عبدالرحمن</td>
                      <td className="px-5 py-3">ابن</td>
                      <td className="px-5 py-3 text-center">8</td>
                      <td className="px-5 py-3">ابتدائي</td>
                    </tr>
                  </tbody>
                </table>
             </div>
          </div>

          {/* Cases History */}
           <div className="bg-white rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm">
             <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
               <h2 className="font-bold font-headline">سجل الحالات والمساعدات السابقة</h2>
             </div>
             <div className="p-5 space-y-4">
                <div className="flex items-start gap-4 p-4 border border-outline-variant/30 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined">inventory_2</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm">كرتونة مواد غذائية (حملة رمضان)</h4>
                      <span className="text-[10px] bg-green-100 text-green-800 px-2 py-1 rounded font-bold">مستلم</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-2">تم تسليم كرتونة غذائية وبطانية ضمن قافلة رمضان.</p>
                    <span className="text-[10px] text-outline font-bold" dir="ltr">15 مارس 2024</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border border-primary/30 bg-primary/5 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-primary">تمكين اقتصادي (كشك)</h4>
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded font-bold border border-primary/20">قيد المراجعة</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-2">طلب تمكين اقتصادي لفتح كشك بقالة صغير بجوار المنزل.</p>
                    <Link href="/dashboard/cases/C-2024-055" className="text-[10px] text-primary font-bold hover:underline">عرض تفاصيل الحالة</Link>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-sm">
             <h3 className="font-bold font-headline mb-4 flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">location_on</span>
               العنوان والتواصل
             </h3>
             <ul className="space-y-4 text-sm">
               <li>
                 <span className="text-xs text-on-surface-variant block mb-1">الرقم القومي (للعائل)</span>
                 <span className="font-bold tracking-widest block" dir="ltr">27512102200123</span>
               </li>
               <li>
                 <span className="text-xs text-on-surface-variant block mb-1">المركز / المحافظة</span>
                 <span className="font-bold block">بني سويف - المركز</span>
               </li>
               <li>
                 <span className="text-xs text-on-surface-variant block mb-1">العنوان التفصيلي</span>
                 <span className="font-bold block">قرية باروط - شارع المستوصف القديم - منزل رقم 5</span>
               </li>
               <li>
                 <span className="text-xs text-on-surface-variant block mb-1">رقم التليفون</span>
                 <span className="font-bold block" dir="ltr">01012345678</span>
               </li>
             </ul>
          </div>
          
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-6 shadow-sm">
             <h3 className="font-bold font-headline mb-4 flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">analytics</span>
               بحث الحالة (التقييم الشامل)
             </h3>
             <p className="text-sm leading-relaxed text-on-surface-variant mb-4 border-r-2 border-primary pr-3">
               أسرة تعاني من فقر شديد بسبب إصابة العائل الرئيسي بكسر مضاعف منعه من العمل منذ عام. الزوجة تعمل كعاملة نظافة متقطعة وأطفالهم في مراحل التعليم الأساسي وتوجد احتمالية لتسريبهم من التعليم لضعف الدخل.
             </p>
             <button className="w-full py-2 bg-white border border-outline-variant/50 hover:bg-surface-container-low rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-colors text-primary">
               تنزيل استمارة البحث كاملة <span className="material-symbols-outlined text-[18px]">download</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
