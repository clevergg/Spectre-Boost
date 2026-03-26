import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { ServicesModule } from './services/services.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),

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
    ReviewsModule,
    TelegramBotModule,
  ],
})
export class AppModule {}
