import Link from "next/link";
import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";

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
                  href="#projects" 
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

        {/* National ID Verification Card Widget (overlapping slightly) */}
        <section className="relative z-20 max-w-4xl mx-auto px-6 -mt-10 mb-16">
          <div className="bg-white rounded-3xl p-8 shadow-[0px_20px_48px_-12px_rgba(0,40,38,0.12)] border border-outline-variant/20 flex flex-col md:flex-row items-end gap-6">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-primary mb-3">تحقق بالرقم القومي</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input 
                  type="text" 
                  maxLength={14}
                  placeholder="أدخل الـ 14 رقم..." 
                  className="w-full bg-surface-container-low border-none rounded-xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 text-lg font-bold tracking-widest text-left"
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-on-surface-variant mt-3 font-medium">يمكنك التحقق من حالة طلبك أو عضويتك باستخدام الرقم القومي الخاص بك.</p>
            </div>
            <button className="w-full md:w-auto px-10 py-4 bg-[#fcb900] text-on-surface hover:bg-[#e5a800] rounded-xl font-bold text-lg transition-transform active:scale-95 shadow-md whitespace-nowrap">
              تحقق الآن
            </button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-b border-outline-variant/10">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-outline-variant/20">
            <div className="p-4">
              <h3 className="text-5xl font-extrabold font-headline text-primary mb-2">+1500</h3>
              <p className="text-lg font-bold text-on-surface">أسرة مستفيدة</p>
              <p className="text-sm text-on-surface-variant mt-1">تتلقى دعماً مستمراً طوال العام الحالي</p>
            </div>
            <div className="p-4">
              <h3 className="text-5xl font-extrabold font-headline text-[#fcb900] mb-2">7</h3>
              <p className="text-lg font-bold text-on-surface">مراكز مغطاة</p>
              <p className="text-sm text-on-surface-variant mt-1">نغطي كافة مراكز محافظة بني سويف</p>
            </div>
            <div className="p-4">
              <h3 className="text-5xl font-extrabold font-headline text-primary mb-2">+200</h3>
              <p className="text-lg font-bold text-on-surface">متطوع</p>
              <p className="text-sm text-on-surface-variant mt-1">يعملون يومياً لخدمة أهالينا</p>
            </div>
          </div>
        </section>

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
        <section className="py-20 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold font-headline text-primary mb-4">أخبار الفرع</h2>
              <p className="text-on-surface-variant text-lg">تابع أحدث فعاليات وأنشطة صناع الحياة في محافظة بني سويف</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* News Item 1 */}
              <div className="bg-white rounded-2xl overflow-hidden border border-outline-variant/20 group hover:shadow-lg transition-all">
                <div className="h-48 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1593113511332-15f5fc8ba482?auto=format&fit=crop&w=500&q=80" alt="News" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-[#fcb900] text-xs font-bold px-3 py-1 rounded-full">فعاليات</div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-outline mb-3">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    15 أكتوبر 2023
                  </div>
                  <h3 className="font-bold text-lg mb-3">إطلاق قافلة طبية بقرية سنور لخدمة 500 حالة</h3>
                  <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">نجح متطوعي الفرع في تنظيم قافلة طبية شاملة بالتعاون مع مديرية الصحة ببني سويف لتقديم الكشف والعلاج المجاني لاهالي قرية سنور.</p>
                  <Link href="#" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                    اقرأ المزيد <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* News Item 2 */}
              <div className="bg-white rounded-2xl overflow-hidden border border-outline-variant/20 group hover:shadow-lg transition-all">
                <div className="h-48 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1531496730074-83b638c0a7ac?auto=format&fit=crop&w=500&q=80" alt="News" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-[#fcb900] text-xs font-bold px-3 py-1 rounded-full">تدريب</div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-outline mb-3">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    10 أكتوبر 2023
                  </div>
                  <h3 className="font-bold text-lg mb-3">بدء الدورة التدريبية لتمكين المرأة الريفية</h3>
                  <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">انطلقت فعاليات التدريب الحرفي لـ 30 سيدة بمركز ببا لتعليمهن مهارات الخياطة والتطريز كخطوة أولى لمشروعاتهن الخاصة.</p>
                  <Link href="#" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                    اقرأ المزيد <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* News Item 3 */}
              <div className="bg-white rounded-2xl overflow-hidden border border-outline-variant/20 group hover:shadow-lg transition-all">
                <div className="h-48 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=500&q=80" alt="News" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-[#fcb900] text-xs font-bold px-3 py-1 rounded-full">تطوع</div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-outline mb-3">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    05 أكتوبر 2023
                  </div>
                  <h3 className="font-bold text-lg mb-3">تكريم المتطوعين المتميزين في حملة المدارس</h3>
                  <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">في احتفالية كبرى بمدينة بني سويف، تم تكريم كوكبة من شباب المتطوعين الذين ساهموا في تجهيز 1000 حقيبة مدرسية.</p>
                  <Link href="#" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                    اقرأ المزيد <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support and Partners Section */}
        <section className="py-16 bg-white border-t border-outline-variant/10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-on-surface-variant font-bold text-sm mb-8">شركاء النجاح والداعمين</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Placeholders for logos */}
               <div className="flex items-center gap-2 font-bold text-xl"><span className="material-symbols-outlined text-3xl">volunteer_activism</span> مؤسسة مجدي يعقوب</div>
               <div className="flex items-center gap-2 font-bold text-xl"><span className="material-symbols-outlined text-3xl">account_balance</span> بنك ناصر الاجتماعي</div>
               <div className="flex items-center gap-2 font-bold text-xl"><span className="material-symbols-outlined text-3xl">local_pharmacy</span> مديرية الصحة</div>
               <div className="flex items-center gap-2 font-bold text-xl"><span className="material-symbols-outlined text-3xl">favorite</span> التحالف الوطني</div>
            </div>
          </div>
        </section>

        {/* CTA (Call To Action) Section */}
        <section className="py-24 bg-primary text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold font-headline leading-tight">
              كن جزءاً من التغيير، وساهم في بناء مجتمع أفضل
            </h2>
            <p className="text-primary-container text-lg md:text-xl">
              سواء كنت مريضاً يحتاج لدعم، أو متبرعاً يسعى للخير، أو متطوعاً يمتلك الوقت والجهد، مكانك محفوظ بيننا.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Link
                href="/request-aid"
                className="w-full sm:w-auto px-8 py-4 bg-[#fcb900] text-[#0b2841] hover:bg-[#e5a800] rounded-xl font-bold text-lg transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">waving_hand</span>
                اطلب مساعدة
              </Link>
              <Link
                href="#"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-lg backdrop-blur-sm transition-colors border border-white/20 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">diversity_1</span>
                تطوع معنا
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-surface">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-primary font-bold text-sm tracking-wide bg-primary/10 px-4 py-1.5 rounded-full inline-block mb-4">الأسئلة الشائعة</span>
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-on-surface">
                إجابات لاستفساراتك
              </h2>
            </div>
            
            <div className="space-y-4">
              <details className="group bg-white border border-outline-variant/30 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-6 font-bold text-lg cursor-pointer text-on-surface">
                  كيف يمكنني التقديم على مساعدة مالية أو طبية؟
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-primary">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-on-surface-variant leading-relaxed">
                  يمكنك التقديم عبر الضغط على زر "اطلب مساعدة" في أعلى الصفحة، وتعبئة النموذج بخطوات بسيطة. سيقوم فريقنا بمراجعة طلبك وإيفاد باحث حالة للتأكد من المعايير واستكمال الإجراءات الميدانية.
                </div>
              </details>

              <details className="group bg-white border border-outline-variant/30 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-6 font-bold text-lg cursor-pointer text-on-surface">
                  ما هي المستندات المطلوبة عند زيارة الباحث؟
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-primary">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-on-surface-variant leading-relaxed">
                  نطلب عادةً صورة البطاقة الشخصية سارية، شهادات ميلاد الأبناء، ما يثبت الدخل (مفردات مرتب أو بحث اجتماعي)، وتقارير طبية حديثة وموثقة إذا كان الطلب يتعلق بحالة مرضية للمراجعة الطبية المتخصصة.
                </div>
              </details>

              <details className="group bg-white border border-outline-variant/30 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-6 font-bold text-lg cursor-pointer text-on-surface">
                  هل يمكنني التطوع في فريق صناع الحياة بفرع بني سويف؟
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-primary">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-on-surface-variant leading-relaxed">
                  بالتأكيد! نرحب دائماً بالمتطوعين في مختلف المجالات (أبحاث ميدانية، تنظيم قوافل، دعم إداري، تصوير وإعلام). يمكنك التواصل معنا عبر أرقامنا وسنتواصل معك لحضور المقابلة التعريفية وتأهيلك.
                </div>
              </details>
              
              <details className="group bg-white border border-outline-variant/30 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-6 font-bold text-lg cursor-pointer text-on-surface">
                  كيف يتم ضمان شفافية توزيع المساعدات؟
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180 text-primary">expand_more</span>
                </summary>
                <div className="px-6 pb-6 text-on-surface-variant leading-relaxed">
                  نظامنا يعتمد بالكامل على التحقق المتعدد: (نموذج إلكتروني، بحث ميداني لتقييم الحالة عبر معايير رقمية دقيقة، ثم مراجعة لجنة التقييم المركزية). النظام مصمم بحيث لا يسمح بتكرار الصرف لذات الغرض إلا وفق لوائح زمنية وبفضل الربط بالرقم القومي.
                </div>
              </details>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
