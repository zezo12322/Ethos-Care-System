import React from "react";
import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <PublicHeader />

      <main className="flex-1">
        {/* Banner */}
        <section className="bg-primary text-white py-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h1 className="text-4xl font-bold font-headline mb-4">من نحن</h1>
            <p className="text-primary-container text-lg max-w-2xl mx-auto">
              جمعية صناع الحياة مصر، مؤسسة أهلية وطنية غير هادفة للربح، تعمل في مجال التنمية المجتمعية وتعبئة طاقات الشباب نحو العمل التطوعي.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 relative bg-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold font-headline text-on-surface mb-4">نسعى لبناء إنسان طموح ومجتمع متكافل</h2>
                <div className="w-16 h-1.5 bg-[#fcb900] rounded-full mb-6"></div>
                <p className="text-on-surface-variant leading-relaxed text-lg">
                  في فرعنا بمحافظة بني سويف، نعمل جاهدين للوصول إلى الأسر الأكثر احتياجاً في قرى ومراكز المحافظة، وتقديم الدعم المباشر ومشاريع التمكين الاقتصادي، معتمدين على كوادرنا الشابة من المتطوعين المخلصين.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined">visibility</span>
                  </div>
                  <h3 className="font-bold font-headline text-xl mb-2">رؤيتنا</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    أن نكون المؤسسة الرائدة في بناء قدرات الشباب وإحداث أثر إيجابي وتنمية مستدامة في المجتمع المصري.
                  </p>
                </div>
                
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
                  <div className="w-12 h-12 bg-[#fcb900]/10 text-[#a37600] rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined">flag</span>
                  </div>
                  <h3 className="font-bold font-headline text-xl mb-2">رسالتنا</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    تحفيز العمل التطوعي، وتمكين الفئات المهمشة من خلال برامج تنموية ومساعدات فعّالة تضمن حياة كريمة ومستقلة.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-surface-container-low rounded-full absolute -top-10 -right-10 w-64 h-64 -z-10"></div>
              <div className="bg-gradient-to-tr from-primary/20 to-surface-container rounded-3xl overflow-hidden aspect-[4/3] border-8 border-white shadow-2xl relative flex items-center justify-center">
                 <span className="material-symbols-outlined text-[100px] text-primary/30">diversity_3</span>
                 <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-sm text-center">
                    <p className="font-bold text-primary font-headline">أكثر من 15 عاماً من العطاء</p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-surface-container-lowest border-t border-outline-variant/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-headline text-on-surface mb-4">القيم التي تحركنا</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
                نستمد قوتنا من مجموعة من المبادئ الراسخة التي تحكم كافة أنشطتنا التنموية وتعاملنا مع المستفيدين والشركاء.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white border border-outline-variant/20 rounded-3xl shadow-sm hover:-translate-y-2 transition-transform duration-300 cursor-default">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-3xl">handshake</span>
                </div>
                <h3 className="font-bold text-xl mb-3">التطوع والعطاء</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">نؤمن بأن كل جهد يقدمه الشباب قادر على تغيير حياة الكثيرين، وأن التطوع هو المحرك الأساسي لنهضة الأمم.</p>
              </div>

              <div className="text-center p-8 bg-white border border-outline-variant/20 rounded-3xl shadow-sm hover:-translate-y-2 transition-transform duration-300 cursor-default">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-3xl">verified</span>
                </div>
                <h3 className="font-bold text-xl mb-3">الشفافية والأمانة</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">نلتزم بالشفافية المطلقة في توجيه أموال المتبرعين ووصول المساعدات لمستحقيها بناءً على بحوث ميدانية دقيقة.</p>
              </div>

              <div className="text-center p-8 bg-white border border-outline-variant/20 rounded-3xl shadow-sm hover:-translate-y-2 transition-transform duration-300 cursor-default">
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-3xl">trending_up</span>
                </div>
                <h3 className="font-bold text-xl mb-3">التنمية المستدامة</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">لا نكتفي بتقديم المساعدات العاجلة، بل نسعى لتمكين الأسر اقتصادياً عبر مشاريع صغيرة تضمن لهم دخلاً ثابتاً.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold font-headline text-on-surface mb-8">فريق العمل (بني سويف)</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg mb-12">
              نفخر بامتلاكنا أكبر قوة تطوعية منظمة ومُدربة للتعامل مع دراسات الحالة وتنظيم القوافل الطبية والتنموية بجميع أنحاء المحافظة.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="px-8 py-3 bg-primary text-white hover:bg-primary-container rounded-xl font-bold transition-colors">
                انضم لفريقنا التطوعي
              </Link>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}