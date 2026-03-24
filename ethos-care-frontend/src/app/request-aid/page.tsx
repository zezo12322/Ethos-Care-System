"use client";

import Link from "next/link";
import { useState } from "react";

export default function RequestAidPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-surface-container-lowest font-body flex flex-col">
      {/* Header (Simplified for public form) */}
      <header className="bg-white border-b border-outline-variant/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="شعار صناع الحياة" className="w-12 h-12 object-contain" />
            <span className="font-headline font-bold text-xl text-primary">أجيال صناع الحياة</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
            العودة للرئيسية <span className="material-symbols-outlined text-[16px] rtl:rotate-180">arrow_back</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold font-headline text-primary mb-3">طلب مساعدة جديد</h1>
          <p className="text-on-surface-variant">الرجاء إدخال بياناتك بدقة لتسهيل عملية التواصل والتقييم من قبل باحثينا.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-10 gap-2">
          <div className={`p-2 rounded-full border-2 ${step >= 1 ? 'border-primary bg-primary text-white' : 'border-outline-variant/50 text-outline'} flex items-center justify-center w-10 h-10 font-bold transition-all`}>1</div>
          <div className={`h-1 w-16 md:w-32 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-surface-container-highest'} transition-colors`}></div>
          <div className={`p-2 rounded-full border-2 ${step >= 2 ? 'border-primary bg-primary text-white' : 'border-outline-variant/50 border-dashed text-outline'} flex items-center justify-center w-10 h-10 font-bold transition-all`}>2</div>
          <div className={`h-1 w-16 md:w-32 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-surface-container-highest'} transition-colors`}></div>
          <div className={`p-2 rounded-full border-2 ${step >= 3 ? 'border-primary bg-primary text-white' : 'border-outline-variant/50 border-dashed text-outline'} flex items-center justify-center w-10 h-10 font-bold transition-all`}>3</div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-outline-variant/30">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold font-headline border-b border-outline-variant/30 pb-4 mb-6">البيانات الشخصية</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">الاسم الرباعي <span className="text-error">*</span></label>
                  <input type="text" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">الرقم القومي (14 رقم) <span className="text-error">*</span></label>
                  <input type="text" dir="ltr" maxLength={14} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">رقم التليفون <span className="text-error">*</span></label>
                  <input type="tel" dir="ltr" className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">المركز / المدينة <span className="text-error">*</span></label>
                  <select className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                    <option value="">اختر المركز...</option>
                    <option>بني سويف</option>
                    <option>الواسطى</option>
                    <option>ناصر</option>
                    <option>اهناسيا</option>
                    <option>ببا</option>
                    <option>الفشن</option>
                    <option>سمسطا</option>
                  </select>
                </div>
              </div>

              <div className="pt-6">
                 <button onClick={() => setStep(2)} className="w-full md:w-auto mr-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white hover:bg-primary-container rounded-xl font-bold transition-all shadow-md">
                   التالي <span className="material-symbols-outlined rtl:rotate-180">arrow_forward</span>
                 </button>
              </div>
            </div>
          )}

          {step === 2 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-bold font-headline border-b border-outline-variant/30 pb-4 mb-6">تفاصيل الحالة</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-3">نوع المساعدة المطلوبة <span className="text-error">*</span></label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-4 border border-outline-variant/50 rounded-xl cursor-pointer hover:bg-surface-container-low">
                       <input type="radio" name="aid_type" className="w-5 h-5 accent-primary" />
                       <span className="font-bold">تدخل طبي (عمليات، علاج)</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-outline-variant/50 rounded-xl cursor-pointer hover:bg-surface-container-low">
                       <input type="radio" name="aid_type" className="w-5 h-5 accent-primary" />
                       <span className="font-bold">تمكين اقتصادي (مشروع صغير)</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-outline-variant/50 rounded-xl cursor-pointer hover:bg-surface-container-low">
                       <input type="radio" name="aid_type" className="w-5 h-5 accent-primary" />
                       <span className="font-bold">سكن كريم (ترميم، وصلات مياه)</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-outline-variant/50 rounded-xl cursor-pointer hover:bg-surface-container-low">
                       <input type="radio" name="aid_type" className="w-5 h-5 accent-primary" />
                       <span className="font-bold">دعم تعليمي / تجهيز عرائس</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">وصف دقيق للحالة ولمبررات الطلب <span className="text-error">*</span></label>
                  <textarea rows={4} className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" placeholder="اكتب هنا تفاصيل المشكلة التي تعاني منها..."></textarea>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between">
                 <button onClick={() => setStep(1)} className="px-6 py-3.5 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors">
                   السابق
                 </button>
                 <button onClick={() => setStep(3)} className="px-8 py-3.5 bg-primary text-white hover:bg-primary-container rounded-xl font-bold transition-all shadow-md flex items-center gap-2">
                   التالي <span className="material-symbols-outlined rtl:rotate-180">arrow_forward</span>
                 </button>
              </div>
            </div>
          )}

          {step === 3 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold font-headline mb-2">تم تسجيل المراجعة مبدئياً</h2>
                <p className="text-on-surface-variant text-sm max-w-md mx-auto leading-relaxed mb-6">
                  برجاء مراجعة البيانات مرة أخيرة قبل التأكيد. سيتم التواصل معك من قبل فريق الأبحاث خلال 7 أيام عمل لتحديد موعد الزيارة الميدانية.
                </p>

                <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 text-right inline-block min-w-[300px]">
                  <p className="text-xs text-on-surface-variant mb-1">رقم الطلب المؤقت</p>
                  <p className="text-2xl font-bold font-headline text-primary tracking-widest" dir="ltr">REQ-2024-819</p>
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant/30 flex items-center justify-between">
                 <button onClick={() => setStep(2)} className="px-6 py-3.5 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-xl transition-colors">
                   السابق وتعديل
                 </button>
                 <button onClick={() => { alert("تم الإرسال بنجاح!"); window.location.href="/"; }} className="px-8 py-3.5 bg-[#fcb900] text-on-surface hover:bg-[#e5a800] rounded-xl font-bold transition-all shadow-md flex items-center gap-2">
                   تأكيد وإرسال الطلب
                   <span className="material-symbols-outlined">send</span>
                 </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
