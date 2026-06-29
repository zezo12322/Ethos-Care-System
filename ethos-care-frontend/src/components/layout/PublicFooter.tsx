import Image from "next/image";
import React from "react";
import Link from "next/link";

const OFFICIAL_EMAIL = "info@lifemakers-bns.com";
const WHATSAPP_NUMBER = "01026236435";
const WHATSAPP_LINK = "https://wa.me/201026236435";
const FACEBOOK_LINK = "https://www.facebook.com/sonna3.bns";

export default function PublicFooter() {
  return (
    <footer className="bg-primary text-white pt-20 pb-8 mt-auto">
      <a
        href={FACEBOOK_LINK}
        target="_blank"
        rel="noreferrer"
        aria-label="تابعنا على فيسبوك"
        className="fixed bottom-24 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1877f2] text-white shadow-2xl shadow-black/25 ring-4 ring-white/80 transition-transform hover:scale-105 focus-visible:outline-white md:left-6"
      >
        <svg
          aria-hidden="true"
          className="h-7 w-7"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M22.68 0H1.32C.59 0 0 .59 0 1.32v21.36C0 23.41.59 24 1.32 24h11.5v-9.29H9.69v-3.62h3.13V8.41c0-3.1 1.89-4.79 4.66-4.79 1.33 0 2.46.1 2.8.14v3.24h-1.92c-1.5 0-1.8.72-1.8 1.76v2.31h3.59l-.47 3.62h-3.12V24h6.12c.73 0 1.32-.59 1.32-1.32V1.32C24 .59 23.41 0 22.68 0Z" />
        </svg>
      </a>

      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noreferrer"
        aria-label="تواصل معنا عبر واتساب"
        className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-2xl shadow-black/25 ring-4 ring-white/80 transition-transform hover:scale-105 focus-visible:outline-white md:bottom-6 md:left-6"
      >
        <svg
          aria-hidden="true"
          className="h-7 w-7"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M20.52 3.48A11.8 11.8 0 0 0 12.12 0C5.58 0 .26 5.32.26 11.86c0 2.09.55 4.13 1.6 5.93L.16 24l6.36-1.67a11.8 11.8 0 0 0 5.6 1.43h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.15-3.47-8.42ZM12.13 21.76h-.01a9.82 9.82 0 0 1-5.01-1.37l-.36-.22-3.77.99 1.01-3.68-.24-.38a9.83 9.83 0 0 1-1.5-5.23c0-5.43 4.42-9.85 9.86-9.85a9.8 9.8 0 0 1 6.96 2.88 9.8 9.8 0 0 1 2.89 6.97c0 5.43-4.42 9.85-9.84 9.85Zm5.4-7.37c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.15-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
        </svg>
      </a>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="شعار صناع الحياة" width={56} height={56} className="w-14 h-14 object-contain" />
            <div className="flex flex-col">
              <span className="font-headline font-bold text-xl leading-none text-white">أجيال صناع الحياة</span>
              <span className="text-[10px] text-white/70 font-bold">بني سويف</span>
            </div>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            نسعى لبناء مجتمع متكافل ومستدام من خلال تقديم الدعم والمساعدة للفئات الأكثر احتياجاً في مختلف قرى ومراكز بني سويف.
          </p>
          <div className="flex gap-4">
            <a href={FACEBOOK_LINK} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors" title="فيسبوك">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/></svg>
            </a>
            <a href={`mailto:${OFFICIAL_EMAIL}`} aria-label="البريد الإلكتروني" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined" aria-hidden="true">alternate_email</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6 border-r-2 border-secondary pr-3">روابط سريعة</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li><Link href="/" className="hover:text-white transition-colors">الرئيسية</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">من نحن</Link></li>
            <li><Link href="/projects" className="hover:text-white transition-colors">الخدمات والمشاريع</Link></li>
            <li><Link href="/request-aid" className="hover:text-white transition-colors">تقديم طلب مساعدة</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6 border-r-2 border-secondary pr-3">تواصل معنا</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary-fixed leading-none">location_on</span>
              حي الزهور الشارع المقابل لمسجد ثروت الدعوري  مركز بني سويف محافظة بني سويف
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-fixed">call</span>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white hover:underline"
                dir="ltr"
              >
                {WHATSAPP_NUMBER}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-fixed">mail</span>
              <a
                href={`mailto:${OFFICIAL_EMAIL}`}
                className="hover:text-white hover:underline"
                dir="ltr"
              >
                {OFFICIAL_EMAIL}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" aria-hidden="true">lock</span>
              البوابة الداخلية
            </h4>
            <p className="text-white/60 text-xs mb-6 leading-relaxed">
              منصة لموظفي الفرع والمتطوعين المسجلين فقط لإدارة الحالات والبيانات.
            </p>
            <Link 
              href="/login"
              className="w-full py-3 bg-secondary text-on-surface hover:bg-secondary/90 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              دخول فريق العمل
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p>© {new Date().getFullYear()} جمعية أجيال صناع الحياة ببني سويف. جميع الحقوق محفوظة.</p>
          <p className="text-white/30">
            رقم القيد: <span className="text-white/50 font-mono">1880</span> لسنة 2013 — مديرية التضامن الاجتماعي بني سويف | الموقع: <span className="text-white/50" dir="ltr">lifemakers-bns.com</span>
          </p>
        </div>
        <div className="flex gap-6">
          <Link href="/about#registration" className="hover:text-white">البيانات التسجيلية</Link>
        </div>
      </div>
    </footer>
  );
}
