const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password', 10);

  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: passwordHash,
      name: 'مدير النظام',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'ceo@test.com' },
    update: {},
    create: {
      email: 'ceo@test.com',
      password: passwordHash,
      name: 'المدير التنفيذي',
      role: 'CEO',
    },
  });

  await prisma.user.upsert({
    where: { email: 'worker@test.com' },
    update: {},
    create: {
      email: 'worker@test.com',
      password: passwordHash,
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
