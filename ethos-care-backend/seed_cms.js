/**
 * CMS Seed Script — run after migration: node seed_cms.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CMS data...\n');

  // ── Site Content ─────────────────────────────────────────────────────────
  await prisma.siteContent.deleteMany({});
  const siteContent = [
    // Hero
    { key: 'hero_title', value: 'نصنع الحياة... بالتمكين والتنمية', label: 'عنوان Hero', group: 'hero' },
    { key: 'hero_subtitle', value: 'نعمل في قلب بني سويف لنبني مجتمعاً متكافئاً، من خلال مشاريع تنموية مستدامة تستهدف الإنسان أولاً وتصنع له مستقبلاً كريماً.', label: 'وصف Hero', group: 'hero' },
    { key: 'hero_image', value: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', label: 'صورة Hero', group: 'hero' },
    { key: 'hero_badge', value: 'جمعية أجيال صناع الحياة ببني سويف', label: 'نص الـ badge', group: 'hero' },
    // About
    { key: 'about_intro', value: 'في فرعنا بمحافظة بني سويف، نعمل جاهدين للوصول إلى الأسر الأكثر احتياجاً في قرى ومراكز المحافظة، وتقديم الدعم المباشر ومشاريع التمكين الاقتصادي، معتمدين على كوادرنا الشابة من المتطوعين المخلصين.', label: 'النص التعريفي', group: 'about' },
    { key: 'about_vision', value: 'أن نكون المؤسسة الرائدة في بناء قدرات الشباب وإحداث أثر إيجابي وتنمية مستدامة في المجتمع المصري.', label: 'الرؤية', group: 'about' },
    { key: 'about_mission', value: 'تحفيز العمل التطوعي، وتمكين الفئات المهمشة من خلال برامج تنموية ومساعدات فعّالة تضمن حياة كريمة ومستقلة.', label: 'الرسالة', group: 'about' },
    { key: 'about_years', value: '15', label: 'سنوات العطاء', group: 'about' },
    // Core values
    { key: 'value1_title', value: 'التطوع والعطاء', label: 'القيمة 1 - العنوان', group: 'values' },
    { key: 'value1_body', value: 'نؤمن بأن كل جهد يقدمه الشباب قادر على تغيير حياة الكثيرين، وأن التطوع هو المحرك الأساسي لنهضة الأمم.', label: 'القيمة 1 - النص', group: 'values' },
    { key: 'value2_title', value: 'الشفافية والأمانة', label: 'القيمة 2 - العنوان', group: 'values' },
    { key: 'value2_body', value: 'نلتزم بالشفافية المطلقة في توجيه أموال المتبرعين ووصول المساعدات لمستحقيها بناءً على بحوث ميدانية دقيقة.', label: 'القيمة 2 - النص', group: 'values' },
    { key: 'value3_title', value: 'التنمية المستدامة', label: 'القيمة 3 - العنوان', group: 'values' },
    { key: 'value3_body', value: 'لا نكتفي بتقديم المساعدات العاجلة، بل نسعى لتمكين الأسر اقتصادياً عبر مشاريع صغيرة تضمن لهم دخلاً ثابتاً.', label: 'القيمة 3 - النص', group: 'values' },
    // Registration
    { key: 'reg_name', value: 'جمعية أجيال صناع الحياة للتنمية ببني سويف', label: 'الاسم الرسمي', group: 'registration' },
    { key: 'reg_number', value: '1880', label: 'رقم القيد', group: 'registration' },
    { key: 'reg_year', value: '2013', label: 'سنة القيد', group: 'registration' },
    { key: 'reg_date', value: '29 / 07 / 2012', label: 'تاريخ القيد', group: 'registration' },
    { key: 'reg_authority', value: 'مديرية التضامن الاجتماعي - بني سويف', label: 'الجهة المسجلة', group: 'registration' },
    { key: 'tax_code', value: '9609', label: 'كود النشاط الضريبي', group: 'registration' },
    { key: 'tax_number', value: '266-144-626-765-492', label: 'الرقم الضريبي', group: 'registration' },
    // Contact
    { key: 'contact_address', value: 'حي الزهور، مقابل مسجد ثروت الدعوري، مركز بني سويف، محافظة بني سويف', label: 'العنوان', group: 'contact' },
    { key: 'contact_phone1', value: '01020040935', label: 'رقم الهاتف 1', group: 'contact' },
    { key: 'contact_phone2', value: '19222', label: 'رقم الهاتف 2', group: 'contact' },
    { key: 'contact_email', value: 'info@lifemakers-bns.org', label: 'البريد الإلكتروني', group: 'contact' },
    { key: 'contact_website', value: 'lifemakers-bns.com', label: 'الموقع الإلكتروني', group: 'contact' },
  ];
  await prisma.siteContent.createMany({ data: siteContent });
  console.log(`  ✓ SiteContent: ${siteContent.length} records`);

  // ── Campaigns ────────────────────────────────────────────────────────────
  await prisma.campaign.deleteMany({});
  const campaigns = [
    { title: 'بطانية الشتاء 2024', description: 'توفير بطاطين وملابس شتوية للأسر الأكثر احتياجاً في قرى بني سويف.', target: 500000, raised: 350000, category: 'موسمي', icon: 'ac_unit', color: 'bg-blue-500', lightColor: 'bg-blue-50', order: 1 },
    { title: 'كفالة الأيتام والأسر المعيلة', description: 'دعم شهري ثابت لتغطية نفقات التعليم والغذاء لعدد 200 أسرة معيلة.', target: 200000, raised: 120000, category: 'رعاية اجتماعية', icon: 'family_restroom', color: 'bg-[#fcb900]', lightColor: 'bg-[#fcb900]/10', order: 2 },
    { title: 'قوافل الرعاية الطبية', description: 'تسيير قافلة شهرية للقرى النائية وتوفير كشوفات وصيدلية مجانية وتحويلات للعمليات الجراحية.', target: 150000, raised: 140000, category: 'صحة', icon: 'medical_services', color: 'bg-primary', lightColor: 'bg-primary/10', order: 3 },
  ];
  await prisma.campaign.createMany({ data: campaigns });
  console.log(`  ✓ Campaign: ${campaigns.length} records`);

  // ── Programs ─────────────────────────────────────────────────────────────
  await prisma.program.deleteMany({});
  const programs = [
    { title: 'التمكين الاقتصادي (مشروعات صغيرة)', description: 'نستبدل المساعدة المؤقتة بمصدر دخل دائم للأسرة من خلال تمويل مشاريع تجارية وزراعية صغيرة (أكشاك، ماكينات خياطة، تربية طيور).', icon: 'storefront', accent: 'text-green-600', bg: 'bg-green-50', order: 1 },
    { title: 'الرعاية الطبية والعمليات', description: 'التكفل بمصاريف العمليات الجراحية الكبرى وتوفير الأجهزة التعويضية وصرف الروشتات الشهرية لأصحاب الأمراض المزمنة.', icon: 'ecg', accent: 'text-red-500', bg: 'bg-red-50', order: 2 },
    { title: 'المساعدات العينية والغذائية', description: 'توزيع كراتين المواد الغذائية واللحوم وتوفير الاحتياجات الأساسية للمنازل (تسقيف، وصلات مياه) وتجهيز العرائس.', icon: 'kitchen', accent: 'text-orange-500', bg: 'bg-orange-50', order: 3 },
    { title: 'الدعم التعليمي', description: 'سداد المصروفات الدراسية للطلبة غير القادرين، وتوفير الشنط والأدوات المدرسية، والمساهمة في فصول محو الأمية للكبار.', icon: 'school', accent: 'text-blue-600', bg: 'bg-blue-50', order: 4 },
  ];
  await prisma.program.createMany({ data: programs });
  console.log(`  ✓ Program: ${programs.length} records`);

  // ── Document Types ───────────────────────────────────────────────────────
  await prisma.documentType.deleteMany({});
  const documentTypes = [
    { name: 'صورة الرقم القومي', required: true, order: 1 },
    { name: 'تقرير طبي', required: false, order: 2 },
    { name: 'إثبات دخل', required: false, order: 3 },
    { name: 'صور حالة السكن', required: false, order: 4 },
    { name: 'شهادة ميلاد', required: false, order: 5 },
    { name: 'وثيقة زواج / طلاق', required: false, order: 6 },
    { name: 'شهادة وفاة العائل', required: false, order: 7 },
  ];
  await prisma.documentType.createMany({ data: documentTypes });
  console.log(`  ✓ DocumentType: ${documentTypes.length} records`);

  // ── Service Types ────────────────────────────────────────────────────────
  await prisma.serviceType.deleteMany({});
  const serviceTypes = [
    { name: 'تمكين اقتصادي', category: 'development', order: 1 },
    { name: 'تدخل طبي', category: 'health', order: 2 },
    { name: 'سكن كريم', category: 'housing', order: 3 },
    { name: 'دعم تعليمي', category: 'education', order: 4 },
    { name: 'دعم غذائي', category: 'food', order: 5 },
    { name: 'دعم نفسي واجتماعي', category: 'social', order: 6 },
  ];
  await prisma.serviceType.createMany({ data: serviceTypes });
  console.log(`  ✓ ServiceType: ${serviceTypes.length} records`);

  // ── Dropdown Options ─────────────────────────────────────────────────────
  await prisma.dropdownOption.deleteMany({});
  const dropdowns = [
    { category: 'socialStatus', value: 'متزوج/ة', label: 'متزوج/ة', order: 1 },
    { category: 'socialStatus', value: 'أرمل/ة', label: 'أرمل/ة', order: 2 },
    { category: 'socialStatus', value: 'مطلق/ة', label: 'مطلق/ة', order: 3 },
    { category: 'socialStatus', value: 'أعزب/عزباء', label: 'أعزب/عزباء', order: 4 },
    { category: 'socialStatus', value: 'غير محدد', label: 'غير محدد', order: 5 },
    { category: 'familyStatus', value: 'تحت التقييم', label: 'تحت التقييم', order: 1 },
    { category: 'familyStatus', value: 'مستحق', label: 'مستحق', order: 2 },
    { category: 'familyStatus', value: 'غير مستحق', label: 'غير مستحق', order: 3 },
    { category: 'familyStatus', value: 'موقف مؤقتاً', label: 'موقف مؤقتاً', order: 4 },
    { category: 'partnerType', value: 'مؤسسة مانحة', label: 'مؤسسة مانحة', order: 1 },
    { category: 'partnerType', value: 'متبرع فردي', label: 'متبرع فردي', order: 2 },
    { category: 'partnerType', value: 'شريك تنفيذي', label: 'شريك تنفيذي', order: 3 },
    { category: 'partnerType', value: 'شريك خدمي', label: 'شريك خدمي', order: 4 },
    { category: 'partnerStatus', value: 'نشط', label: 'نشط', order: 1 },
    { category: 'partnerStatus', value: 'غير نشط', label: 'غير نشط', order: 2 },
    { category: 'partnerStatus', value: 'موقف', label: 'موقف', order: 3 },
    { category: 'newsCategory', value: 'فعاليات', label: 'فعاليات', order: 1 },
    { category: 'newsCategory', value: 'أخبار', label: 'أخبار', order: 2 },
    { category: 'newsCategory', value: 'إعلانات', label: 'إعلانات', order: 3 },
    { category: 'newsCategory', value: 'تقارير', label: 'تقارير', order: 4 },
    { category: 'newsCategory', value: 'قصص نجاح', label: 'قصص نجاح', order: 5 },
    { category: 'locationType', value: 'قرية', label: 'قرية', order: 1 },
    { category: 'locationType', value: 'مركز', label: 'مركز', order: 2 },
    { category: 'locationType', value: 'مدينة', label: 'مدينة', order: 3 },
    { category: 'locationType', value: 'حي', label: 'حي', order: 4 },
    { category: 'operationStatus', value: 'تجهيز', label: 'تجهيز', order: 1 },
    { category: 'operationStatus', value: 'جارٍ', label: 'جارٍ', order: 2 },
    { category: 'operationStatus', value: 'مكتمل', label: 'مكتمل', order: 3 },
    { category: 'operationStatus', value: 'موقف', label: 'موقف', order: 4 },
    { category: 'memberRelation', value: 'ابن/ة', label: 'ابن/ة', order: 1 },
    { category: 'memberRelation', value: 'زوج/زوجة', label: 'زوج/زوجة', order: 2 },
    { category: 'memberRelation', value: 'أخ/أخت', label: 'أخ/أخت', order: 3 },
    { category: 'memberRelation', value: 'أم', label: 'أم', order: 4 },
    { category: 'memberRelation', value: 'أب', label: 'أب', order: 5 },
    { category: 'memberRelation', value: 'جد', label: 'جد', order: 6 },
    { category: 'memberRelation', value: 'جدة', label: 'جدة', order: 7 },
    { category: 'memberRelation', value: 'أخرى', label: 'أخرى', order: 8 },
    { category: 'memberEducation', value: 'لا يدرس', label: 'لا يدرس', order: 1 },
    { category: 'memberEducation', value: 'روضة', label: 'روضة', order: 2 },
    { category: 'memberEducation', value: 'ابتدائي', label: 'ابتدائي', order: 3 },
    { category: 'memberEducation', value: 'إعدادي', label: 'إعدادي', order: 4 },
    { category: 'memberEducation', value: 'ثانوي', label: 'ثانوي', order: 5 },
    { category: 'memberEducation', value: 'جامعي', label: 'جامعي', order: 6 },
    { category: 'memberEducation', value: 'فوق الجامعي', label: 'فوق الجامعي', order: 7 },
  ];
  await prisma.dropdownOption.createMany({ data: dropdowns });
  console.log(`  ✓ DropdownOption: ${dropdowns.length} records`);

  // ── System Config ────────────────────────────────────────────────────────
  const configs = [
    { key: 'org.name', value: 'جمعية صناع الحياة - بني سويف', label: 'اسم الجمعية', group: 'organization', type: 'string' },
    { key: 'org.website', value: 'https://lifemakers-bns.com', label: 'الموقع الإلكتروني', group: 'organization', type: 'string' },
    { key: 'org.email', value: 'ceo@lifemakers-bns.com', label: 'البريد الإلكتروني', group: 'organization', type: 'string' },
    { key: 'org.phone', value: '', label: 'رقم الهاتف', group: 'organization', type: 'string' },
    { key: 'org.address', value: 'بني سويف، مصر', label: 'العنوان', group: 'organization', type: 'string' },
    { key: 'org.default_region', value: 'بني سويف', label: 'المنطقة الافتراضية', group: 'organization', type: 'string' },
    { key: 'rate_limit.general', value: '30', label: 'الحد العام (طلبات/دقيقة)', group: 'rate_limit', type: 'number' },
    { key: 'rate_limit.auth', value: '5', label: 'حد تسجيل الدخول (طلبات/دقيقة)', group: 'rate_limit', type: 'number' },
  ];
  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }
  console.log(`  ✓ SystemConfig: ${configs.length} records`);

  console.log('\n✅ CMS seed completed!');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
