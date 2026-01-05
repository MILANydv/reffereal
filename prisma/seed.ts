import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db',
});

const prisma = new PrismaClient({
  adapter: adapter,
});

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      active: true,
    },
  });

  console.log('Super Admin created:', superAdmin.email);

  const partnerPassword = await bcrypt.hash('partner123', 10);

  const partnerUser = await prisma.user.upsert({
    where: { email: 'partner@example.com' },
    update: {},
    create: {
      email: 'partner@example.com',
      password: partnerPassword,
      name: 'Test Partner',
      role: 'PARTNER',
      active: true,
      partners: {
        create: {
          companyName: 'Test Company',
        },
      },
    },
  });

  console.log('Test Partner created:', partnerUser.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
