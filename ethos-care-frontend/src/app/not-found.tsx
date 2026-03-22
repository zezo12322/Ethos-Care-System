import Link from 'next/link';
import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container-lowest text-center p-4 rtl">
      <div className="mb-6 w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
         <span className="material-symbols-outlined text-[64px] text-primary">wrong_location</span>
      </div>
      <h1 className="text-6xl font-black text-primary font-headline mb-4">404</h1>
      <h2 className="text-2xl font-bold text-on-surface mb-2">عفواً، هذه الصفحة غير موجودة</h2>
      <p className="text-on-surface-variant max-w-md mx-auto mb-8">
        يبدو أنك تبحث عن صفحة غير موجودة أو تم نقلها. يرجى العودة إلى الصفحة الرئيسية أو التحقق من الرابط.
      </p>
      <Link href="/" className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-container transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
        <span className="material-symbols-outlined">home</span>
        العودة للرئيسية
      </Link>
    </div>
  );
}
