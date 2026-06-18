/**
 * Locations Seed (اتصال مباشر بقاعدة البيانات) — مراكز وقرى محافظة بني سويف.
 *
 * التشغيل:  node seed_locations.js
 *
 * ⚠️ يتطلب أن يكون IP جهازك مسموحًا به في firewall قاعدة بيانات Azure.
 *    لو الوصول المباشر مرفوض، استخدم بدلًا منه:  node seed_locations_api.js
 *
 * - آمن لإعادة التشغيل: لا يضيف موقعًا موجودًا مسبقًا ولا يحذف أي مواقع قائمة.
 */
const { PrismaClient } = require('@prisma/client');
const { buildLocations } = require('./beni_suef_locations');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding مراكز وقرى بني سويف (اتصال مباشر)...\n');

  const existing = await prisma.location.findMany({
    select: { name: true, type: true, region: true },
  });
  const seen = new Set(existing.map((l) => `${l.type}|${l.name}|${l.region}`));

  const toCreate = buildLocations().filter(
    (l) => !seen.has(`${l.type}|${l.name}|${l.region}`),
  );

  if (toCreate.length === 0) {
    console.log('  ✓ لا توجد مواقع جديدة لإضافتها (كلها موجودة بالفعل).');
  } else {
    await prisma.location.createMany({ data: toCreate });
    const centers = toCreate.filter((l) => l.type === 'مركز').length;
    const villages = toCreate.filter((l) => l.type === 'قرية').length;
    console.log(
      `  ✓ تمت إضافة ${toCreate.length} موقعًا (${centers} مركز، ${villages} قرية).`,
    );
  }

  console.log('\n✅ Locations seed completed!');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
