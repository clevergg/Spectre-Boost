import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { OrdersService, OrderCreatedEvent, OrderStatusChangedEvent } from '../orders/orders.service';
import {
  orderActionKeyboard,
  orderStartKeyboard,
  orderCompleteKeyboard,
  workerContactKeyboard,
} from './keyboards/inline-keyboards';

@Injectable()
export class TelegramBotService {
  private readonly logger = new Logger(TelegramBotService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
  ) {}

  // ─── Event Listeners ───

  /**
   * Обработка события: заказ создан
   */
  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    this.logger.log(`Handling order.created: #${event.orderId}`);

    const order = await this.prisma.order.findUnique({
      where: { id: event.orderId },
      include: {
        service: { include: { gameCategory: true, serviceType: true } },
        customer: true,
      },
    });

    if (!order) return;

    // 1. Уведомить покупателя
    await this.notifyCustomerOrderCreated(order);

    // 2. Найти свободных работников и отправить заказ
    await this.distributeOrderToWorkers(order);
  }

  /**
   * Обработка события: статус заказа изменился
   */
  @OnEvent('order.status.changed')
  async handleOrderStatusChanged(event: OrderStatusChangedEvent) {
    this.logger.log(
      `Handling order.status.changed: #${event.orderId} ${event.oldStatus} → ${event.newStatus}`,
    );

    const order = await this.prisma.order.findUnique({
      where: { id: event.orderId },
      include: {
        service: { include: { gameCategory: true } },
        customer: true,
        worker: true,
      },
    });

    if (!order) return;

    switch (event.newStatus) {
      case 'ASSIGNED':
        await this.notifyCustomerWorkerAssigned(order);
        await this.notifyWorkerOrderConfirmed(order);
        break;

      case 'IN_PROGRESS':
        await this.notifyCustomerOrderInProgress(order);
        await this.notifyWorkerOrderStarted(order);
        break;

      case 'COMPLETED':
        await this.notifyCustomerOrderCompleted(order);
        if (order.workerId) {
          await this.usersService.incrementWorkerStats(order.workerId);
        }
        break;

      case 'CANCELLED':
        if (order.worker) {
          await this.notifyWorkerOrderCancelled(order);
        }
        break;
    }
  }

  // ─── Уведомления покупателю ───

  private async notifyCustomerOrderCreated(order: any) {
    try {
      const msg = await this.bot.telegram.sendMessage(
        order.customer.telegramId.toString(),
        `🛒 *Заказ #${order.id} создан!*\n\n` +
          `📌 Услуга: ${order.service.name}\n` +
          `🎮 Игра: ${order.service.gameCategory.name}\n` +
          `💰 Стоимость: ${order.totalPrice} ₽\n\n` +
          `⏳ Ищем свободного бустера...`,
        { parse_mode: 'Markdown' },
      );

      await this.ordersService.saveBotMessageId(
        order.id,
        'customerMsgId',
        msg.message_id,
      );
    } catch (err) {
      this.logger.error(`Failed to notify customer: ${err}`);
    }
  }

  private async notifyCustomerWorkerAssigned(order: any) {
    if (!order.worker) return;

    try {
      const workerName = order.worker.username
        ? `@${order.worker.username}`
        : order.worker.firstName || 'Бустер';

      await this.bot.telegram.sendMessage(
        order.customer.telegramId.toString(),
        `✅ *Заказ #${order.id} — бустер найден!*\n\n` +
          `👤 Бустер: ${workerName}\n` +
          `⭐ Рейтинг: ${order.worker.rating}/5\n` +
          `📊 Выполнено заказов: ${order.worker.completedCount}\n\n` +
          `Свяжитесь с бустером для передачи данных аккаунта:`,
        {
          parse_mode: 'Markdown',
          ...workerContactKeyboard(order.worker.username || ''),
        },
      );
    } catch (err) {
      this.logger.error(`Failed to notify customer about assignment: ${err}`);
    }
  }

  private async notifyCustomerOrderInProgress(order: any) {
    try {
      await this.bot.telegram.sendMessage(
        order.customer.telegramId.toString(),
        `🔄 *Заказ #${order.id} — в работе!*\n\n` +
          `Бустер приступил к выполнению вашего заказа.`,
        { parse_mode: 'Markdown' },
      );
    } catch (err) {
      this.logger.error(`Failed to notify customer: ${err}`);
    }
  }

  private async notifyCustomerOrderCompleted(order: any) {
    try {
      await this.bot.telegram.sendMessage(
        order.customer.telegramId.toString(),
        `🎉 *Заказ #${order.id} — завершён!*\n\n` +
          `Ваш заказ выполнен. Спасибо что выбрали Spectre!\n` +
          `Если у вас есть вопросы — обратитесь в поддержку.`,
        { parse_mode: 'Markdown' },
      );
    } catch (err) {
      this.logger.error(`Failed to notify customer: ${err}`);
    }
  }

  // ─── Уведомления работнику ───

  private async notifyWorkerOrderConfirmed(order: any) {
    if (!order.worker) return;

    try {
      const customerName = order.customer.username
        ? `@${order.customer.username}`
        : order.customer.firstName || 'Покупатель';

      await this.bot.telegram.sendMessage(
        order.worker.telegramId.toString(),
        `✅ *Заказ #${order.id} — за вами!*\n\n` +
          `👤 Покупатель: ${customerName}\n` +
          `📌 ${String(order.service.name)}\n` +
          `💰 ${order.totalPrice} ₽\n\n` +
          `Свяжитесь с покупателем для получения данных аккаунта.\n` +
          `Когда будете готовы — нажмите "Начать выполнение".`,
        {
          parse_mode: 'Markdown',
          ...orderStartKeyboard(order.id),
        },
      );
    } catch (err) {
      this.logger.error(`Failed to notify worker: ${err}`);
    }
  }

  private async notifyWorkerOrderCancelled(order: any) {
    if (!order.worker) return;

    try {
      await this.bot.telegram.sendMessage(
        order.worker.telegramId.toString(),
        `❌ *Заказ #${order.id} — отменён*\n\n` +
          `Заказ был отменён покупателем.`,
        { parse_mode: 'Markdown' },
      );
    } catch (err) {
      this.logger.error(`Failed to notify worker: ${err}`);
    }
  }

  /**
   * Уведомить работника что заказ в работе — показать кнопку "Завершить"
   */
  private async notifyWorkerOrderStarted(order: any) {
    if (!order.worker) return;

    try {
      await this.bot.telegram.sendMessage(
        order.worker.telegramId.toString(),
        `🔄 *Заказ #${order.id} — в работе!*\n\n` +
          `Когда завершите — нажмите кнопку ниже.`,
        {
          parse_mode: 'Markdown',
          ...orderCompleteKeyboard(order.id),
        },
      );
    } catch (err) {
      this.logger.error(`Failed to notify worker about start: ${err}`);
    }
  }

  // ─── Распределение заказов ───

  /**
   * Найти свободного работника и отправить ему заказ
   */
  async distributeOrderToWorkers(order: any) {
    const gameCategoryId = order.service.gameCategoryId;
    const workers = await this.usersService.findAvailableWorkers(gameCategoryId);

    if (workers.length === 0) {
      this.logger.warn(`No available workers for order #${order.id}`);
      await this.bot.telegram.sendMessage(
        order.customer.telegramId.toString(),
        `⏳ *Заказ #${order.id}*\n\n` +
          `К сожалению, сейчас все бустеры заняты.\n` +
          `Мы уведомим вас, как только кто-то освободится.`,
        { parse_mode: 'Markdown' },
      );
      return;
    }

    // Отправляем первому подходящему работнику
    const worker = workers[0];

    // Логируем для отладки
    this.logger.log(`Sending order #${order.id} to worker: telegramId=${worker.telegramId}`);
    this.logger.log(`Service: ${order.service?.name}, Category: ${order.service?.gameCategory?.name}`);
    this.logger.log(`Price: ${order.totalPrice}, Start: ${order.startValue}, Target: ${order.targetValue}`);

    try {
      // Формируем текст отдельно для наглядности
      const rangeText = (order.startValue != null && order.targetValue != null)
        ? `📊 ${order.startValue} → ${order.targetValue}\n`
        : '';

      const messageText =
        `📦 *Новый заказ #${order.id}!*\n\n` +
        `🎮 ${String(order.service.gameCategory.name)}\n` +
        `📌 ${String(order.service.name)}\n` +
        rangeText +
        `💰 ${order.totalPrice} ₽\n\n` +
        `Хотите взять заказ?`;

      const keyboard = orderActionKeyboard(order.id);

      const msg = await this.bot.telegram.sendMessage(
        worker.telegramId.toString(),
        messageText,
        {
          parse_mode: 'Markdown',
          ...keyboard,
        },
      );

      await this.ordersService.saveBotMessageId(
        order.id,
        'botMessageId',
        msg.message_id,
      );
    } catch (err) {
      this.logger.error(
        `Failed to send order to worker ${worker.telegramId}: ${err}`,
      );
    }
  }
}
