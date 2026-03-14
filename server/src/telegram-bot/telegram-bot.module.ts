import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotUpdate } from './telegram-bot.update';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN!,
      // Можно настроить webhook вместо polling для production:
      // launchOptions: {
      //   webhook: {
      //     domain: 'https://yourdomain.com',
      //     hookPath: '/telegram-webhook',
      //   },
      // },
    }),
    UsersModule,
    OrdersModule,
  ],
  providers: [TelegramBotService, TelegramBotUpdate],
  exports: [TelegramBotService],
})
export class TelegramBotModule {}
