const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: 'password', // in real app should be hashed
      name: 'مدير النظام',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'ceo@test.com' },
    update: {},
    create: {
      email: 'ceo@test.com',
      password: 'password',
      name: 'المدير التنفيذي',
      role: 'CEO',
    },
  });

  await prisma.user.upsert({
    where: { email: 'worker@test.com' },
    update: {},
    create: {
      email: 'worker@test.com',
      password: 'password',
      name: 'باحث حالة',
      role: 'CASE_WORKER',
    },
  });

  console.log("Users seeded!");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
