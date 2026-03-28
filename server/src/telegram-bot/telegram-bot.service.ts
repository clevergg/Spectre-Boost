import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { OrdersService, OrderCreatedEvent, OrderStatusChangedEvent } from '../orders/orders.service';
import { encrypt, decrypt } from '../common/utils/encryption';
import {
  orderActionKeyboard,
  orderStartKeyboard,
  orderCompleteKeyboard,
  workerContactKeyboard,
  ratingKeyboard,
} from './keyboards/inline-keyboards';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private readonly logger = new Logger(TelegramBotService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * Единый обработчик всех сообщений:
   * 1. Фото с caption /support → тикет поддержки
   * 2. Сообщение от юзера с активным заказом → анонимный чат
   * 3. Остальное → игнорируем
   */
  onModuleInit() {
    this.logger.log('Registering unified message handler...');

    this.bot.on('message', async (ctx) => {
      const from = ctx.from;
      if (!from) return;

      const msg = ctx.message as any;

      // Логируем тип каждого сообщения
      const msgType = msg.text ? 'text' : msg.photo ? 'photo' : msg.document ? 'document' : msg.sticker ? 'sticker' : msg.voice ? 'voice' : msg.video ? 'video' : msg.video_note ? 'video_note' : 'unknown';
      this.logger.log(`>>> Message received: type=${msgType}, from=${from.id}`);

      // Пропускаем команды
      if (msg.text && msg.text.startsWith('/')) return;

      // ─── 1. Проверяем: фото для поддержки? ───
      const caption = msg.caption || '';
      if (msg.photo && caption.toLowerCase().includes('/support')) {
        await this.handleSupportPhoto(ctx, from, msg);
        return;
      }

      // ─── 2. Анонимный чат ───
      const user = await this.prisma.user.findUnique({
        where: { telegramId: BigInt(from.id) },
      });
      if (!user) return;

      // Ищем активный заказ
      const activeOrder = await this.prisma.order.findFirst({
        where: {
          status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
          OR: [
            { customerId: user.id },
            { workerId: user.id },
          ],
        },
        include: { customer: true, worker: true },
      });

      if (!activeOrder || !activeOrder.worker) return;

      const isCustomer = activeOrder.customerId === user.id;
      const isWorker = activeOrder.workerId === user.id;
      if (!isCustomer && !isWorker) return;

      const recipientTelegramId = isCustomer
        ? activeOrder.worker.telegramId.toString()
        : activeOrder.customer.telegramId.toString();

      const senderLabel = isCustomer ? '👤 Покупатель' : '👷 Бустер';
      const senderRole = isCustomer ? 'CUSTOMER' : 'WORKER';
      const prefix = `${senderLabel} (заказ #${activeOrder.id})`;

      try {
        if (msg.text) {
          await ctx.telegram.sendMessage(recipientTelegramId, `${prefix}:\n${msg.text}`);
          await this.saveChatMessage(activeOrder.id, user.id, senderRole, msg.text, null, null);

        } else if (msg.photo) {
          const photo = msg.photo[msg.photo.length - 1];
          await ctx.telegram.sendPhoto(recipientTelegramId, photo.file_id, {
            caption: `${prefix}${msg.caption ? ':\n' + msg.caption : ''}`,
          });
          await this.saveChatMessage(activeOrder.id, user.id, senderRole, msg.caption || null, photo.file_id, 'photo');

        } else if (msg.document) {
          await ctx.telegram.sendDocument(recipientTelegramId, msg.document.file_id, {
            caption: `${prefix}${msg.caption ? ':\n' + msg.caption : ''}`,
          });
          await this.saveChatMessage(activeOrder.id, user.id, senderRole, msg.caption || null, msg.document.file_id, 'document');

        } else if (msg.sticker) {
          await ctx.telegram.sendMessage(recipientTelegramId, `${prefix}:`);
          await ctx.telegram.sendSticker(recipientTelegramId, msg.sticker.file_id);
          await this.saveChatMessage(activeOrder.id, user.id, senderRole, null, msg.sticker.file_id, 'sticker');

        } else if (msg.voice) {
          await ctx.telegram.sendVoice(recipientTelegramId, msg.voice.file_id, {
            caption: prefix,
          });
          await this.saveChatMessage(activeOrder.id, user.id, senderRole, null, msg.voice.file_id, 'voice');

        } else if (msg.video) {
          await ctx.telegram.sendVideo(recipientTelegramId, msg.video.file_id, {
            caption: `${prefix}${msg.caption ? ':\n' + msg.caption : ''}`,
          });
          await this.saveChatMessage(activeOrder.id, user.id, senderRole, msg.caption || null, msg.video.file_id, 'video');

        } else if (msg.video_note) {
          await ctx.telegram.sendMessage(recipientTelegramId, `${prefix}:`);
          await ctx.telegram.sendVideoNote(recipientTelegramId, msg.video_note.file_id);
          await this.saveChatMessage(activeOrder.id, user.id, senderRole, null, msg.video_note.file_id, 'video_note');

        } else {
          return; // неподдерживаемый тип
        }

        // Галочка доставки
        await ctx.reply('✓', { reply_parameters: { message_id: msg.message_id } });

      } catch (err) {
        this.logger.error(`Chat relay error: ${err}`);
        await ctx.reply('⚠️ Не удалось отправить сообщение.');
      }
    });
  }

  /**
   * Сохранить сообщение чата с шифрованием
   */
  private async saveChatMessage(
    orderId: number,
    senderId: number,
    senderRole: string,
    text: string | null,
    fileId: string | null,
    fileType: string | null,
  ) {
    await this.prisma.chatMessage.create({
      data: {
        orderId,
        senderId,
        senderRole,
        text: text ? encrypt(text) : null,
        fileId,
        fileType,
      },
    });
  }

  /**
   * Обработка фото для тикета поддержки
   */
  private async handleSupportPhoto(ctx: any, from: any, msg: any) {
    const photo = msg.photo[msg.photo.length - 1];
    const fileId = photo.file_id;
    const caption = msg.caption || '';
    const message = caption.replace(/\/support/i, '').trim() || 'Фото без описания';

    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(from.id) },
    });

    if (!user) {
      await ctx.reply('Сначала зарегистрируйтесь: /start');
      return;
    }

    const userName = from.username
      ? `@${from.username}`
      : from.first_name || `ID ${from.id}`;

    const ticket = await this.prisma.supportTicket.create({
      data: {
        message,
        photoFileId: fileId,
        userId: user.id,
      },
    });

    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    if (admins.length === 0) {
      await ctx.reply('⚠️ Администраторы сейчас недоступны.');
      return;
    }

    const ticketText =
      `🆘 <b>Тикет #${ticket.id} 📷</b>\n\n` +
      `👤 От: ${this.esc(userName)} (ID: ${user.id})\n` +
      `💬 ${this.esc(message)}\n\n` +
      `Ответить: <code>/reply ${ticket.id} текст</code>`;

    const shortCaption =
      `🆘 Тикет #${ticket.id} 📷\n` +
      `От: ${this.esc(userName)}\n` +
      `→ /reply ${ticket.id} ответ`;

    for (const admin of admins) {
      try {
        const adminChatId = admin.telegramId.toString();
        await ctx.telegram.sendPhoto(adminChatId, fileId, { caption: shortCaption });
        await ctx.telegram.sendMessage(adminChatId, ticketText, { parse_mode: 'HTML' });
      } catch (err) {
        this.logger.error(`Failed to send photo ticket to admin: ${err}`);
      }
    }

    await ctx.reply(
      `✅ <b>Обращение #${ticket.id} с фото отправлено!</b>`,
      { parse_mode: 'HTML' },
    );
  }

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
      const discountLine = order.discount
        ? `🏷 Скидка: ${order.discount}% по промокоду\n`
        : '';

      const msg = await this.bot.telegram.sendMessage(
        order.customer.telegramId.toString(),
        `🛒 <b>Заказ #${order.id} создан!</b>\n\n` +
          `📌 Услуга: ${this.esc(order.service.name)}\n` +
          `🎮 Игра: ${this.esc(order.service.gameCategory.name)}\n` +
          discountLine +
          `💰 Стоимость: ${order.totalPrice} ₽\n\n` +
          `⏳ Ищем свободного бустера...`,
        { parse_mode: 'HTML' },
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
      // Уведомляем покупателя
      await this.bot.telegram.sendMessage(
        order.customer.telegramId.toString(),
        `✅ <b>Заказ #${order.id} — бустер найден!</b>\n\n` +
          `⭐ Рейтинг бустера: ${order.worker.rating}/5\n` +
          `📊 Выполнено заказов: ${order.worker.completedCount}\n\n` +
          `💬 <b>Чат открыт!</b>\n` +
          `Просто напишите сообщение в этот чат — бустер его получит анонимно.`,
        { parse_mode: 'HTML' },
      );

      // Уведомляем бустера
      await this.bot.telegram.sendMessage(
        order.worker.telegramId.toString(),
        `💬 <b>Чат с покупателем открыт (заказ #${order.id})</b>\n\n` +
          `Просто напишите сообщение — покупатель получит его анонимно.\n` +
          `Чат будет закрыт после завершения заказа.`,
        { parse_mode: 'HTML' },
      );
    } catch (err) {
      this.logger.error(`Failed to notify about assignment: ${err}`);
    }
  }

  private async notifyCustomerOrderInProgress(order: any) {
    try {
      await this.bot.telegram.sendMessage(
        order.customer.telegramId.toString(),
        `🔄 <b>Заказ #${order.id} — в работе!</b>\n\n` +
          `Бустер приступил к выполнению вашего заказа.`,
        { parse_mode: 'HTML' },
      );
    } catch (err) {
      this.logger.error(`Failed to notify customer: ${err}`);
    }
  }

  private async notifyCustomerOrderCompleted(order: any) {
    try {
      await this.bot.telegram.sendMessage(
        order.customer.telegramId.toString(),
        `🎉 <b>Заказ #${order.id} — завершён!</b>\n\n` +
          `Ваш заказ выполнен. Спасибо что выбрали Spectre!\n\n` +
          `Оцените работу бустера:`,
        {
          parse_mode: 'HTML',
          reply_markup: ratingKeyboard(order.id).reply_markup,
        },
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
        ? `@${this.esc(order.customer.username)}`
        : this.esc(order.customer.firstName || 'Покупатель');

      await this.bot.telegram.sendMessage(
        order.worker.telegramId.toString(),
        `✅ <b>Заказ #${order.id} — за вами!</b>\n\n` +
          `👤 Покупатель: ${customerName}\n` +
          `📌 ${this.esc(order.service.name)}\n` +
          `💰 ${order.totalPrice} ₽\n\n` +
          `Свяжитесь с покупателем для получения данных аккаунта.\n` +
          `Когда будете готовы — нажмите "Начать выполнение".`,
        {
          parse_mode: 'HTML',
          reply_markup: orderStartKeyboard(order.id).reply_markup,
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
        `❌ <b>Заказ #${order.id} — отменён</b>\n\n` +
          `Заказ был отменён покупателем.`,
        { parse_mode: 'HTML' },
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
        `🔄 <b>Заказ #${order.id} — в работе!</b>\n\n` +
          `Когда завершите — нажмите кнопку ниже.`,
        {
          parse_mode: 'HTML',
          reply_markup: orderCompleteKeyboard(order.id).reply_markup,
        },
      );
    } catch (err) {
      this.logger.error(`Failed to notify worker about start: ${err}`);
    }
  }

  // ─── Распределение заказов ───

  /**
   * Найти свободного работника и отправить ему заказ.
   * excludeWorkerIds — ID работников которые уже отклонили этот заказ.
   */
  async distributeOrderToWorkers(order: any, excludeWorkerIds: number[] = []) {
    const gameCategoryId = order.service.gameCategoryId;
    let workers = await this.usersService.findAvailableWorkers(gameCategoryId);

    // Исключаем тех кто уже отклонил
    if (excludeWorkerIds.length > 0) {
      workers = workers.filter((w: any) => !excludeWorkerIds.includes(w.id));
    }

    if (workers.length === 0) {
      this.logger.warn(`No available workers for order #${order.id}`);
      await this.bot.telegram.sendMessage(
        order.customer.telegramId.toString(),
        `⏳ <b>Заказ #${order.id}</b>\n\n` +
          `К сожалению, сейчас все бустеры заняты.\n` +
          `Мы уведомим вас, как только кто-то освободится.`,
        { parse_mode: 'HTML' },
      );
      return;
    }

    const worker = workers[0];

    try {
      const rangeText = (order.startValue != null && order.targetValue != null)
        ? `📊 ${order.startValue} → ${order.targetValue}\n`
        : '';

      const messageText =
        `📦 <b>Новый заказ #${order.id}!</b>\n\n` +
        `🎮 ${this.esc(order.service.gameCategory.name)}\n` +
        `📌 ${this.esc(order.service.name)}\n` +
        rangeText +
        `💰 ${order.totalPrice} ₽\n\n` +
        `Хотите взять заказ?`;

      const msg = await this.bot.telegram.sendMessage(
        worker.telegramId.toString(),
        messageText,
        {
          parse_mode: 'HTML',
          reply_markup: orderActionKeyboard(order.id).reply_markup,
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

  /**
   * Экранирование спецсимволов для HTML parse_mode.
   * Без этого символы <, >, & в именах пользователей сломают парсинг.
   */
  private esc(text: string): string {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
