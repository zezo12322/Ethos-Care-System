import React from "react";
import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="bg-[#0b2841] text-white pt-20 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="شعار صناع الحياة" className="w-14 h-14 object-contain" />
            <div className="flex flex-col">
              <span className="font-headline font-bold text-xl leading-none text-white">أجيال صناع الحياة</span>
              <span className="text-[10px] text-white/70 font-bold">بني سويف</span>
            </div>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            نسعى لبناء مجتمع متكافل ومستدام من خلال تقديم الدعم والمساعدة للفئات الأكثر احتياجاً في مختلف قرى ومراكز بني سويف.
          </p>
          <div className="flex gap-4">
            <a href="https://Facebook.com/sonna3.bns?" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors" title="فيسبوك">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined">alternate_email</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6 border-r-2 border-[#fcb900] pr-3">روابط سريعة</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li><Link href="/" className="hover:text-white transition-colors">الرئيسية</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">من نحن</Link></li>
            <li><Link href="/projects" className="hover:text-white transition-colors">الخدمات والمشاريع</Link></li>
            <li><Link href="/#faq" className="hover:text-white transition-colors">الأسئلة الشائعة</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6 border-r-2 border-[#fcb900] pr-3">تواصل معنا</h4>
          <ul className="space-y-4 text-sm text-white/70">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary-fixed leading-none">location_on</span>
              حي الزهور الشارع المقابل لمسجد ثروت الدعوري  مركز بني سويف محافظة بني سويف
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-fixed">call</span>
              <span dir="ltr">01020040935</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-fixed">mail</span>
              <span dir="ltr">info.benisuef@lifemakers.org</span>
            </li>
          </ul>
        </div>

        <div>
          <div className="bg-[#06192a] p-6 rounded-2xl border border-white/5">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fcb900]">lock</span>
              البوابة الداخلية
            </h4>
            <p className="text-white/60 text-xs mb-6 leading-relaxed">
              منصة لموظفي الفرع والمتطوعين المسجلين فقط لإدارة الحالات والبيانات.
            </p>
            <Link 
              href="/login"
              className="w-full py-3 bg-[#fcb900] text-[#0b2841] hover:bg-[#e5a800] rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              دخول فريق العمل
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
        <p>© 2024 جمعية أجيال صناع الحياة ببني سويف. جميع الحقوق محفوظة.</p>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-white">سياسة الخصوصية</Link>
          <Link href="#" className="hover:text-white">شروط الاستخدام</Link>
        </div>
      </div>
    </footer>
  );
}