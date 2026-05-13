import React from "react";
import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";
import Link from "next/link";

export default function ProjectsPage() {
  const activeCampaigns = [
    {
      id: 1,
      title: "بطانية الشتاء 2024",
      description: "توفير بطاطين وملابس شتوية للأسر الأكثر احتياجاً في قرى بني سويف.",
      target: 500000,
      raised: 350000,
      category: "موسمي",
      icon: "ac_unit",
      color: "bg-blue-500",
      lightColor: "bg-blue-50"
    },
    {
      id: 2,
      title: "كفالة الأيتام والأسر المعيلة",
      description: "دعم شهري ثابت لتغطية نفقات التعليم والغذاء لعدد 200 أسرة معيلة.",
      target: 200000,
      raised: 120000,
      category: "رعاية اجتماعية",
      icon: "family_restroom",
      color: "bg-[#fcb900]",
      lightColor: "bg-[#fcb900]/10"
    },
    {
      id: 3,
      title: "قوافل الرعاية الطبية",
      description: "تسيير قافلة شهرية للقرى النائية وتوفير كشوفات وصيدلية مجانية وتحويلات للعمليات الجراحية.",
      target: 150000,
      raised: 140000,
      category: "صحة",
      icon: "medical_services",
      color: "bg-primary",
      lightColor: "bg-primary/10"
    }
  ];

  const mainPrograms = [
    {
      title: "التمكين الاقتصادي (مشروعات صغيرة)",
      description: "نستبدل المساعدة المؤقتة بمصدر دخل دائم للأسرة من خلال تمويل مشاريع تجارية وزراعية صغيرة (أكشاك، ماكينات خياطة، تربية طيور).",
      icon: "storefront",
      accent: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "الرعاية الطبية والعمليات",
      description: "التكفل بمصاريف العمليات الجراحية الكبرى وتوفير الأجهزة التعويضية وصرف الروشتات الشهرية لأصحاب الأمراض المزمنة.",
      icon: "ecg",
      accent: "text-red-500",
      bg: "bg-red-50"
    },
    {
      title: "المساعدات العينية والغذائية",
      description: "توزيع كراتين المواد الغذائية واللحوم وتوفير الاحتياجات الأساسية للمنازل (تسقيف، وصلات مياه) وتجهيز العرائس.",
      icon: "kitchen",
      accent: "text-orange-500",
      bg: "bg-orange-50"
    },
    {
      title: "الدعم التعليمي",
      description: "سداد المصروفات الدراسية للطلبة غير القادرين، وتوفير الشنط والأدوات المدرسية، والمساهمة في فصول محو الأمية للكبار.",
      icon: "school",
      accent: "text-blue-600",
      bg: "bg-blue-50"
    }
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <PublicHeader />

      <main className="flex-1">
        {/* Banner Section */}
        <section className="bg-primary text-white py-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#fcb900]/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <span className="text-sm font-bold bg-white/10 px-4 py-1.5 rounded-full inline-block mb-4 border border-white/20">أعمالنا على الأرض</span>
            <h1 className="text-3xl md:text-5xl font-bold font-headline mb-6">الخدمات والمشاريع التنموية</h1>
            <p className="text-primary-container text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              جهود مستمرة لتوظيف التبرعات في مكانها الصحيح لبناء الإنسان وتمكينه من العيش بكرامة عبر برامج مستدامة وحملات دورية.
            </p>
          </div>
        </section>

        {/* Active Campaigns Section */}
        <section className="py-20 bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-outline-variant/20 pb-6">
              <div>
                <h2 className="text-3xl font-bold font-headline text-on-surface mb-2">الحملات والمشاريع الجارية</h2>
                <p className="text-on-surface-variant">الفرص المتاحة للمساهمة والتبرع الآن لدعم خطط الفرع القادمة.</p>
              </div>
              <button className="px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors">
                عرض كل الحملات
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeCampaigns.map((campaign) => {
                const percentage = Math.round((campaign.raised / campaign.target) * 100);
                
                return (
                  <div key={campaign.id} className="bg-white rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                    <div className={`${campaign.lightColor} p-8 flex items-center justify-center relative overflow-hidden`}>
                      <span className={`material-symbols-outlined text-[80px] ${campaign.color.replace('bg-', 'text-')} opacity-20 transform group-hover:scale-110 transition-transform duration-500`}>
                        {campaign.icon}
                      </span>
                      <div className="absolute top-4 right-4">
                         <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                           {campaign.category}
                         </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold font-headline mb-3 text-on-surface">{campaign.title}</h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-1">
                        {campaign.description}
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm mb-1 font-bold">
                          <span className="text-on-surface-variant">نسبة الإنجاز</span>
                          <span className={`${campaign.color.replace('bg-', 'text-')}`} dir="ltr">{percentage}%</span>
                        </div>
                        <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden flex" dir="ltr">
                          <div 
                            className={`h-full ${campaign.color} rounded-full`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-on-surface-variant font-bold">
                          <div className="flex flex-col">
                            <span className="font-normal text-[10px]">الهدف</span>
                            <span dir="ltr">{campaign.target.toLocaleString()} EGP</span>
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-normal text-[10px]">تم جمعه</span>
                            <span dir="ltr">{campaign.raised.toLocaleString()} EGP</span>
                          </div>
                        </div>
                      </div>
                      
                      <button className="w-full mt-6 py-3 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-bold transition-colors">
                        تبرع الآن
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Core Services Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-headline text-on-surface mb-2">برامجنا الرئيسية</h2>
              <div className="w-20 h-1 bg-[#fcb900] mx-auto rounded-full mt-4 mb-4"></div>
              <p className="text-on-surface-variant max-w-2xl mx-auto">
                نقدم حزمة متكاملة من الخدمات التنموية المصممة لانتشال الأسر من دائرة الفقر وتوفير احتياجاتهم بحلول علمية مدروسة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mainPrograms.map((prog, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-6 p-8 rounded-3xl border border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30 transition-colors">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${prog.bg} ${prog.accent}`}>
                    <span className="material-symbols-outlined text-3xl">{prog.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline mb-3 text-on-surface">{prog.title}</h3>
                    <p className="text-on-surface-variant leading-relaxed text-sm">
                      {prog.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA (Request Aid directly) */}
        <section className="py-16 bg-[#0b2841] text-white">
          <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-right">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-headline mb-2">تحتاج إلى مساعدة أو دعم؟</h2>
              <p className="text-white/70 max-w-xl">
                إذا كنت أو أي شخص تعرفه في حاجة إلى إحدى الخدمات المذكورة، يمكنك تقديم طلب إلكتروني فوراً ليقوم فريق البحث الميداني بزيارتك وتقييم الحالة.
              </p>
            </div>
            <Link 
              href="/request-aid" 
              className="px-8 py-4 bg-[#fcb900] text-[#0b2841] hover:bg-[#e5a800] rounded-xl font-bold text-lg transition-colors shadow-lg flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
            >
              <span className="material-symbols-outlined">description</span>
              تقديم طلب مساعدة
            </Link>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}