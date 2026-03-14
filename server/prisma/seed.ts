import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Категории игр ───
  const pubg = await prisma.gameCategory.upsert({
    where: { name: 'PUBG' },
    update: {},
    create: {
      name: 'PUBG',
      description: 'PlayerUnknown\'s Battlegrounds',
    },
  });

  console.log(`✅ Game category: ${pubg.name}`);

  // ─── Типы услуг ───
  const boostRank = await prisma.serviceType.upsert({
    where: { name: 'Буст ранга' },
    update: {},
    create: {
      name: 'Буст ранга',
      description: 'Повышение ранга в рейтинговых играх',
    },
  });

  const levelUp = await prisma.serviceType.upsert({
    where: { name: 'Прокачка уровня' },
    update: {},
    create: {
      name: 'Прокачка уровня',
      description: 'Повышение уровня аккаунта',
    },
  });

  const survival = await prisma.serviceType.upsert({
    where: { name: 'Выживания' },
    update: {},
    create: {
      name: 'Выживания',
      description: 'Выполнение достижений по выживаниям',
    },
  });

  console.log(`✅ Service types: ${boostRank.name}, ${levelUp.name}, ${survival.name}`);

  // ─── Услуги (PUBG) ───
  const services = [
    {
      name: 'PUBG Буст ранга',
      description: 'Повышение ранга от Бронзы до Мастера',
      basePrice: 1000,
      pricePerUnit: 1000,
      minUnits: 1,
      maxUnits: 6,
      gameCategoryId: pubg.id,
      serviceTypeId: boostRank.id,
    },
    {
      name: 'PUBG Прокачка уровня',
      description: 'Прокачка уровня аккаунта до 80',
      basePrice: 500,
      pricePerUnit: 100,
      minUnits: 1,
      maxUnits: 80,
      gameCategoryId: pubg.id,
      serviceTypeId: levelUp.id,
    },
    {
      name: 'PUBG Выживания',
      description: 'Все достижения по выживаниям',
      basePrice: 3000,
      pricePerUnit: null,
      minUnits: null,
      maxUnits: null,
      gameCategoryId: pubg.id,
      serviceTypeId: survival.id,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: 0 }, // Нет уникального поля — создаём всегда
      update: {},
      create: service,
    });
  }

  // Workaround: используем createMany если данные ещё не созданы
  const existingServices = await prisma.service.count();
  if (existingServices === 0) {
    await prisma.service.createMany({ data: services });
  }

  console.log(`✅ Services seeded`);

  // ─── Админ (опционально) ───
  const adminTelegramId = process.env.ADMIN_TELEGRAM_ID;
  if (adminTelegramId) {
    await prisma.user.upsert({
      where: { telegramId: BigInt(adminTelegramId) },
      update: { role: Role.ADMIN },
      create: {
        telegramId: BigInt(adminTelegramId),
        firstName: 'Admin',
        role: Role.ADMIN,
      },
    });
    console.log(`✅ Admin user created`);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
