/**
 * ChatCleanupService — автоудаление сообщений старше 30 дней.
 * Запускается каждый день в 3:00 ночи.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatCleanupService {
  private readonly logger = new Logger(ChatCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Каждый день в 3:00 — удаляем сообщения старше 30 дней
   */
  @Cron('0 3 * * *')
  async cleanupOldMessages() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const result = await this.prisma.chatMessage.deleteMany({
        where: {
          createdAt: { lt: thirtyDaysAgo },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} chat messages older than 30 days`);
      }
    } catch (err) {
      this.logger.error(`Chat cleanup failed: ${err}`);
    }
  }
}
