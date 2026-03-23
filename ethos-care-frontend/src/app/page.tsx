import Link from "next/link";
import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";

import VerificationWidget from "@/components/VerificationWidget";
import DynamicStats from "@/components/DynamicStats";
import DynamicNews from "@/components/DynamicNews";
import DynamicPartners from "@/components/DynamicPartners";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-surface-container-lowest py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-low text-primary text-xs font-bold rounded-full border border-outline-variant/30">
                <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                جمعية صناع الحياة مصر - فرع بني سويف
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold font-headline leading-[1.1] text-primary">
                نصنع الحياة... <br />
                <span className="text-[#fcb900]">بالتمكين والتنمية</span>
              </h1>
              
              <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed font-medium">
                نعمل في قلب بني سويف لنبني مجتمعاً متكافئاً، من خلال مشاريع تنموية مستدامة تستهدف الإنسان أولاً وتصنع له مستقبلاً كريماً.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link 
                  href="/request-aid" 
                  className="px-8 py-4 bg-primary text-white hover:bg-primary-container rounded-2xl font-bold text-lg transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
                >
                  ابدأ طلب مساعدة
                  <span className="material-symbols-outlined rtl:rotate-180">arrow_right_alt</span>
                </Link>
                <Link 
                  href="/projects" 
                  className="px-8 py-4 bg-white text-primary border border-outline-variant/30 hover:bg-surface-container-low rounded-2xl font-bold text-lg transition-all"
                >
                  تعرف على مشاريعنا
                </Link>
              </div>

              <div className="pt-6 flex items-center gap-4 text-sm text-on-surface-variant font-medium">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  <img src="https://ui-avatars.com/api/?name=Mo&background=0D8ABC&color=fff" alt="M" className="w-8 h-8 rounded-full border-2 border-white" />
                  <img src="https://ui-avatars.com/api/?name=Sa&background=fcb900&color=000" alt="S" className="w-8 h-8 rounded-full border-2 border-white" />
                  <img src="https://ui-avatars.com/api/?name=Ah&background=005c55&color=fff" alt="A" className="w-8 h-8 rounded-full border-2 border-white" />
                </div>
                <span>بإشراف وزارة التضامن الاجتماعي</span>
              </div>
            </div>

            <div className="relative h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              {/* Fallback image representing community/kids in case specific asset is missing */}
              <img 
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="أطفال مجتمعنا" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent mix-blend-multiply"></div>
            </div>
          </div>
        </section>

        {/* Verification Card Widget */}
        <section className="relative z-20 max-w-4xl mx-auto px-6 -mt-10 mb-16">
          <VerificationWidget />
        </section>

        {/* Stats Section */}
        <DynamicStats />

        {/* Services Section */}
        <section id="services" className="py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="border-r-4 border-[#fcb900] pr-6">
                <h2 className="text-3xl lg:text-4xl font-extrabold font-headline text-primary mb-4">خدماتنا التنموية</h2>
                <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
                  نقدم حزمة متكاملة من التدخلات التي تهدف إلى تحسين جودة الحياة في مجتمعاتنا المحلية ببني سويف، مع التركيز على الاستدامة والتمكين المباشر.
                </p>
              </div>
              <Link href="/services" className="flex items-center gap-2 text-primary font-bold hover:underline shrink-0">
                عرض كافة الخدمات
                <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Highlighted Service Card (Economic Empowerment) */}
              <div className="lg:col-span-2 relative rounded-3xl overflow-hidden group min-h-[300px]">
                <img 
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="تمكين اقتصادي" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#003430] via-[#005c55]/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="w-12 h-12 bg-[#fcb900] rounded-xl flex items-center justify-center mb-4 text-on-surface">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-2">تمكين اقتصادي</h3>
                  <p className="text-emerald-50/90 leading-relaxed max-w-md">
                    دعم المشروعات الصغيرة ومتناهية الصغر للشباب والنساء المعيلات لضمان مصدر دخل مستدام وتحويل الأسر من الاحتياج إلى الإنتاج.
                  </p>
                </div>
              </div>

              {/* Service Card 2 */}
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/20 hover:shadow-xl transition-shadow flex flex-col justify-end min-h-[300px]">
                <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center mb-auto text-primary">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <h3 className="text-xl font-bold font-headline text-on-surface mb-3 mt-8">دعم تعليمي</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  برامج محو الأمية، وتوفير المستلزمات المدرسية، وكفالة الطلاب المتفوقين دراسياً.
                </p>
              </div>

              {/* Service Card 3 */}
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/20 hover:shadow-xl transition-shadow flex flex-col justify-end min-h-[300px]">
                <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center mb-auto text-error">
                  <span className="material-symbols-outlined">medical_services</span>
                </div>
                <h3 className="text-xl font-bold font-headline text-on-surface mb-3 mt-8">تدخلات صحية</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  قوافل طبية متخصصة في القرى، وتوفير الأدوية وإجراء العمليات الجراحية العاجلة للمرضى.
                </p>
              </div>

              {/* Service Card 4 */}
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/20 hover:shadow-xl transition-shadow flex flex-col justify-end min-h-[300px] lg:col-span-2">
                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-auto text-primary">
                  <span className="material-symbols-outlined">home_work</span>
                </div>
                <h3 className="text-xl font-bold font-headline text-on-surface mb-3 mt-8">سكن كريم</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
                  ترميم المنازل وتوفير وصلات المياه النظيفة والكهرباء للقرى الأكثر احتياجاً في مراكز المحافظة. المستهدف توفير بيئة معيشية آمنة.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* News Section */}
        <DynamicNews />


        {/* Verification Card Widget */}
        <section className="relative z-20 max-w-4xl mx-auto px-6 -mt-10 mb-16">
          <VerificationWidget />
        </section>

        {/* Stats Section */}
        <DynamicStats />

        {/* Services Section */}
        <section id="services" className="py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="border-r-4 border-[#fcb900] pr-6">
                <h2 className="text-3xl lg:text-4xl font-extrabold font-headline text-primary mb-4">خدماتنا التنموية</h2>
                <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
                  نقدم حزمة متكاملة من التدخلات التي تهدف إلى تحسين جودة الحياة في مجتمعاتنا المحلية ببني سويف، مع التركيز على الاستدامة والتمكين المباشر.
                </p>
              </div>
              <Link href="/services" className="flex items-center gap-2 text-primary font-bold hover:underline shrink-0">
                عرض كافة الخدمات
                <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Highlighted Service Card (Economic Empowerment) */}
              <div className="lg:col-span-2 relative rounded-3xl overflow-hidden group min-h-[300px]">
                <img 
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="تمكين اقتصادي" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#003430] via-[#005c55]/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="w-12 h-12 bg-[#fcb900] rounded-xl flex items-center justify-center mb-4 text-on-surface">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-2">تمكين اقتصادي</h3>
                  <p className="text-emerald-50/90 leading-relaxed max-w-md">
                    دعم المشروعات الصغيرة ومتناهية الصغر للشباب والنساء المعيلات لضمان مصدر دخل مستدام وتحويل الأسر من الاحتياج إلى الإنتاج.
                  </p>
                </div>
              </div>

              {/* Service Card 2 */}
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/20 hover:shadow-xl transition-shadow flex flex-col justify-end min-h-[300px]">
                <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center mb-auto text-primary">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <h3 className="text-xl font-bold font-headline text-on-surface mb-3 mt-8">دعم تعليمي</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  برامج محو الأمية، وتوفير المستلزمات المدرسية، وكفالة الطلاب المتفوقين دراسياً.
                </p>
              </div>

              {/* Service Card 3 */}
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/20 hover:shadow-xl transition-shadow flex flex-col justify-end min-h-[300px]">
                <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center mb-auto text-error">
                  <span className="material-symbols-outlined">medical_services</span>
                </div>
                <h3 className="text-xl font-bold font-headline text-on-surface mb-3 mt-8">تدخلات صحية</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  قوافل طبية متخصصة في القرى، وتوفير الأدوية وإجراء العمليات الجراحية العاجلة للمرضى.
                </p>
              </div>

              {/* Service Card 4 */}
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/20 hover:shadow-xl transition-shadow flex flex-col justify-end min-h-[300px] lg:col-span-2">
                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-auto text-primary">
                  <span className="material-symbols-outlined">home_work</span>
                </div>
                <h3 className="text-xl font-bold font-headline text-on-surface mb-3 mt-8">سكن كريم</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
                  ترميم المنازل وتوفير وصلات المياه النظيفة والكهرباء للقرى الأكثر احتياجاً في مراكز المحافظة. المستهدف توفير بيئة معيشية آمنة.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* News Section */}
        <DynamicNews />

        {/* Support and Partners Section */}
        <DynamicPartners />


        {/* Verification Card Widget */}
        <section className="relative z-20 max-w-4xl mx-auto px-6 -mt-10 mb-16">
          <VerificationWidget />
        </section>

        {/* Stats Section */}
        <DynamicStats />

        {/* Services Section */}
        <section id="services" className="py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="border-r-4 border-[#fcb900] pr-6">
                <h2 className="text-3xl lg:text-4xl font-extrabold font-headline text-primary mb-4">خدماتنا التنموية</h2>
                <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
                  نقدم حزمة متكاملة من التدخلات التي تهدف إلى تحسين جودة الحياة في مجتمعاتنا المحلية ببني سويف، مع التركيز على الاستدامة والتمكين المباشر.
                </p>
              </div>
              <Link href="/services" className="flex items-center gap-2 text-primary font-bold hover:underline shrink-0">
                عرض كافة الخدمات
                <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Highlighted Service Card (Economic Empowerment) */}
              <div className="lg:col-span-2 relative rounded-3xl overflow-hidden group min-h-[300px]">
                <img 
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="تمكين اقتصادي" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#003430] via-[#005c55]/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="w-12 h-12 bg-[#fcb900] rounded-xl flex items-center justify-center mb-4 text-on-surface">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-2">تمكين اقتصادي</h3>
                  <p className="text-emerald-50/90 leading-relaxed max-w-md">
                    دعم المشروعات الصغيرة ومتناهية الصغر للشباب والنساء المعيلات لضمان مصدر دخل مستدام وتحويل الأسر من الاحتياج إلى الإنتاج.
                  </p>
                </div>
              </div>

              {/* Service Card 2 */}
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/20 hover:shadow-xl transition-shadow flex flex-col justify-end min-h-[300px]">
                <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center mb-auto text-primary">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <h3 className="text-xl font-bold font-headline text-on-surface mb-3 mt-8">دعم تعليمي</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  برامج محو الأمية، وتوفير المستلزمات المدرسية، وكفالة الطلاب المتفوقين دراسياً.
                </p>
              </div>

              {/* Service Card 3 */}
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/20 hover:shadow-xl transition-shadow flex flex-col justify-end min-h-[300px]">
                <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center mb-auto text-error">
                  <span className="material-symbols-outlined">medical_services</span>
                </div>
                <h3 className="text-xl font-bold font-headline text-on-surface mb-3 mt-8">تدخلات صحية</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  قوافل طبية متخصصة في القرى، وتوفير الأدوية وإجراء العمليات الجراحية العاجلة للمرضى.
                </p>
              </div>

              {/* Service Card 4 */}
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/20 hover:shadow-xl transition-shadow flex flex-col justify-end min-h-[300px] lg:col-span-2">
                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-auto text-primary">
                  <span className="material-symbols-outlined">home_work</span>
                </div>
                <h3 className="text-xl font-bold font-headline text-on-surface mb-3 mt-8">سكن كريم</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">
                  ترميم المنازل وتوفير وصلات المياه النظيفة والكهرباء للقرى الأكثر احتياجاً في مراكز المحافظة. المستهدف توفير بيئة معيشية آمنة.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* News Section */}
        <DynamicNews />

        {/* Support and Partners Section */}
        <DynamicPartners />
      </main>

      <PublicFooter />
    </div>
  );
}
