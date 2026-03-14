import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { ServicesModule } from './services/services.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';

@Module({
  imports: [
    // Event system for Orders ↔ Bot communication
    EventEmitterModule.forRoot(),

    // Rate limiting: 10 requests per 60 seconds by default
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),

    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    OrdersModule,
    ServicesModule,
    TelegramBotModule,
  ],
})
export class AppModule {}
