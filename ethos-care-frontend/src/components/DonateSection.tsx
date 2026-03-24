import React from 'react';

export default function DonateSection() {
  return (
    <section id="donate" className="py-20 bg-primary-container relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pattern_donate" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern_donate)" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white text-primary text-xs font-bold rounded-full mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[14px]">favorite</span>
            ساهم في التغيير
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold font-headline text-on-primary-container mb-4">وسائل التبرع</h2>
          <p className="text-on-surface-variant text-lg">تبرعك يصنع فارقاً في حياة الكثيرين، اختر الوسيلة الأنسب لك وكن جزءاً من الأثر الإيجابي.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl text-[#E60000]">phone_iphone</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-1">فودافون كاش</h3>
                <p className="text-on-surface-variant text-sm mb-2">يمكنك التبرع بكل سهولة عبر محفظة فودافون كاش على الرقم التالي:</p>
                <div className="bg-surface-container-low px-4 py-3 rounded-xl font-mono text-2xl font-bold text-primary inline-block" dir="ltr">
                  01026236435
                </div>
              </div>
            </div>

            <div className="h-px bg-outline-variant/30 w-full line-dashed"></div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl text-primary">account_balance</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-1">التحويل البنكي</h3>
                <p className="text-on-surface-variant text-sm mb-3">حسابنا البنكي لاستقبال التبرعات والزكاة والصدقات:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="text-xs text-on-surface-variant mb-1 font-bold">اسم المستفيد</p>
                    <p className="font-bold text-on-surface">جمعية اجيال صناع الحياة</p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="text-xs text-on-surface-variant mb-1 font-bold">رقم الحساب الدولي (IBAN)</p>
                    <p className="font-mono font-bold text-primary text-sm break-all" dir="ltr">390004603000006204030002652</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
