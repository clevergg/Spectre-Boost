import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');

    await this.ensureAdmin();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
  private async ensureAdmin() {
    const adminTelegramId = process.env.ADMIN_TELEGRAM_ID;
    if (!adminTelegramId) {
      this.logger.warn('ADMIN_TELEGRAM_ID not set — no admin will be created');
      return;
    }

    try {
      const admin = await this.user.upsert({
        where: { telegramId: BigInt(adminTelegramId) },
        update: { role: Role.ADMIN },
        create: {
          telegramId: BigInt(adminTelegramId),
          firstName: 'Admin',
          role: Role.ADMIN,
        },
      });

      this.logger.log(`Admin ensured: user #${admin.id} (TG: ${adminTelegramId})`);
    } catch (err) {
      this.logger.error(`Failed to ensure admin: ${err}`);
    }
  }
}
