'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container-lowest text-center p-4 rtl">
      <div className="mb-6 w-32 h-32 bg-red-100 rounded-full flex items-center justify-center">
         <span className="material-symbols-outlined text-[64px] text-red-600">error</span>
      </div>
      <h1 className="text-4xl font-black text-on-surface font-headline mb-4">خطأ في النظام</h1>
      <h2 className="text-xl font-bold text-on-surface-variant mb-4">عفواً، حدث خطأ غير متوقع</h2>
      <p className="text-on-surface-variant max-w-md mx-auto mb-8">
        نأسف لحدوث هذا الخطأ. المهندسون لدينا تلقوا تقريرًا وسيقومون بالعمل على حله في أسرع وقت.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-surface-container-highest text-on-surface rounded-xl font-bold hover:bg-outline-variant/30 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">refresh</span>
          المحاولة مرة أخرى
        </button>
        <Link href="/" className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-container transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined">home</span>
          الرئيسية
        </Link>
      </div>
    </div>
  );
}
