import React from "react";
import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="bg-[#0b2841] text-white pt-20 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
              <img src="/logo.png" alt="شعار صناع الحياة" className="w-10 h-10 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-xl leading-none text-white">صناع الحياة</span>
              <span className="text-[10px] text-white/70 font-bold">بني سويف</span>
            </div>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            نسعى لبناء مجتمع متكافل ومستدام من خلال تقديم الدعم والمساعدة للفئات الأكثر احتياجاً في مختلف قرى ومراكز بني سويف.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined">language</span>
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
              بني سويف، شارع بورسعيد، بجوار المحافظة
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-fixed">call</span>
              <span dir="ltr">19222 (الخط الساخن)</span>
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
        <p>© 2024 جمعية صناع الحياة مصر - فرع بني سويف. جميع الحقوق محفوظة.</p>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-white">سياسة الخصوصية</Link>
          <Link href="#" className="hover:text-white">شروط الاستخدام</Link>
        </div>
      </div>
    </footer>
  );
}