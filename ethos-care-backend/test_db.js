const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.user.count();
    console.log('✅ Supabase متصل! عدد اليوزرات:', count);
  } catch (e) {
    console.log('❌ فشل الاتصال:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
