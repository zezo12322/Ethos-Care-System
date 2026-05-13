const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password', 10);

  const users = [
    { email: 'admin@test.com',                 name: 'مدير النظام',     role: 'ADMIN' },
    { email: 'ceo@test.com',                   name: 'المدير التنفيذي', role: 'CEO' },
    { email: 'casemanager@lifemakers-bns.com', name: 'Al-Zahraa Ahmed', role: 'MANAGER' },
    { email: 'worker@lifemakers-bns.com',      name: 'worker',          role: 'CASE_WORKER' },
    { email: 'worker2@lifemakers-bns.com',     name: 'worker',          role: 'CASE_WORKER' },
    { email: 'worker3@lifemakers-bns.com',     name: 'worker',          role: 'CASE_WORKER' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: { email: user.email, name: user.name, role: user.role, password: passwordHash },
    });
    console.log(`✅ ${user.email}`);
  }

  console.log('\n🎉 Users seeded!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
