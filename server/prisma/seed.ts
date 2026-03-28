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
      description: 'Повышение рейтинга в рейтинговых играх',
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

  const survivorType = await prisma.serviceType.upsert({
    where: { name: 'Выживший' },
    update: {},
    create: {
      name: 'Выживший',
      description: 'Топ 50 сезона — буст и удержание ранга Выживший',
    },
  });

  console.log(`✅ Service types: ${boostRank.name}, ${levelUp.name}, ${survival.name}, ${survivorType.name}`);

  // ─── Услуги (PUBG) ───

  // Проверяем существующие услуги чтобы не дублировать
  const existingServices = await prisma.service.findMany();
  const existingNames = existingServices.map(s => s.name);

  const newServices = [];

  if (!existingNames.includes('PUBG Буст ранга')) {
    newServices.push({
      name: 'PUBG Буст ранга',
      description: 'Повышение рейтинга от Бронзы до Мастера',
      basePrice: 1000,
      pricePerUnit: 1000,
      minUnits: 1,
      maxUnits: 6,
      gameCategoryId: pubg.id,
      serviceTypeId: boostRank.id,
    });
  }

  if (!existingNames.includes('PUBG Прокачка уровня')) {
    newServices.push({
      name: 'PUBG Прокачка уровня',
      description: 'Прокачка уровня аккаунта до 80',
      basePrice: 500,
      pricePerUnit: 100,
      minUnits: 1,
      maxUnits: 80,
      gameCategoryId: pubg.id,
      serviceTypeId: levelUp.id,
    });
  }

  if (!existingNames.includes('PUBG Выживания')) {
    newServices.push({
      name: 'PUBG Выживания',
      description: 'Все достижения по выживаниям',
      basePrice: 3000,
      pricePerUnit: null,
      minUnits: null,
      maxUnits: null,
      gameCategoryId: pubg.id,
      serviceTypeId: survival.id,
    });
  }

  // ─── Новые услуги: Выживший ───

  if (!existingNames.includes('Выживший — Полный надзор')) {
    newServices.push({
      name: 'Выживший — Полный надзор',
      description: 'Бустер поддерживает ваш ранг в Топ 50 до конца сезона. Играет минимум 1 матч в неделю, чтобы рейтинг не снижался.',
      basePrice: 15000,
      pricePerUnit: null,
      minUnits: null,
      maxUnits: null,
      gameCategoryId: pubg.id,
      serviceTypeId: survivorType.id,
    });
  }

  if (!existingNames.includes('Выживший — Буст до ПТС')) {
    newServices.push({
      name: 'Выживший — Буст до ПТС',
      description: 'Бустер набирает целевые ПТС прошлого сезона (например 4300). После достижения цели заказ завершается — удержание рейтинга на вас.',
      basePrice: 10000,
      pricePerUnit: null,
      minUnits: null,
      maxUnits: null,
      gameCategoryId: pubg.id,
      serviceTypeId: survivorType.id,
    });
  }

  if (newServices.length > 0) {
    await prisma.service.createMany({ data: newServices });
    console.log(`✅ Created ${newServices.length} new services`);
  } else {
    console.log(`✅ All services already exist`);
  }

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
