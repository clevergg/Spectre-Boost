import { Logger } from '@nestjs/common';
import { Update, Start, Command, Action, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { ReviewsService } from '../reviews/reviews.service';
import { PromoService } from '../promo/promo.service';
import { TelegramBotService } from './telegram-bot.service';
import { decrypt } from '../common/utils/encryption';
import {
  availabilityKeyboard,
  reviewModerationKeyboard,
  workerManageKeyboard,
} from './keyboards/inline-keyboards';
import { Role, OrderStatus } from '@prisma/client';

@Update()
export class TelegramBotUpdate {
  private readonly logger = new Logger(TelegramBotUpdate.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
    private readonly reviewsService: ReviewsService,
    private readonly promoService: PromoService,
    private readonly botService: TelegramBotService,
  ) {}

  /**
   * /start — регистрация пользователя
   */
  @Start()
  async onStart(@Ctx() ctx: Context) {
    const from = ctx.from;
    if (!from) return;

    // Создаём или обновляем пользователя
    const user = await this.prisma.user.upsert({
      where: { telegramId: BigInt(from.id) },
      update: {
        username: from.username || null,
        firstName: from.first_name || null,
        lastName: from.last_name || null,
      },
      create: {
        telegramId: BigInt(from.id),
        username: from.username || null,
        firstName: from.first_name || null,
        lastName: from.last_name || null,
      },
    });

    const roleText =
      user.role === Role.WORKER
        ? '👷 Вы зарегистрированы как бустер'
        : user.role === Role.ADMIN
          ? '👑 Вы администратор'
          : '👤 Вы зарегистрированы как покупатель';

    const workerCmds = user.role === Role.WORKER
      ? `/status — Мой статус\n/available — Переключить доступность\n`
      : '';

    const adminCmds = user.role === Role.ADMIN
      ? `\n<b>Админ-команды:</b>\n` +
        `/reviews — Модерация отзывов\n` +
        `/workers — Управление бустерами\n` +
        `/orders — Последние заказы\n` +
        `/stats — Статистика\n` +
        `/tickets — Неотвеченные обращения\n` +
        `/ticket ID — Открыть тикет\n` +
        `/promo — Управление промокодами\n` +
        `/chat ID — Переписка по заказу\n` +
        `/setrole @user ROLE — Назначить роль\n` +
        `/reply ID текст — Ответить на обращение\n`
      : '';

    await ctx.telegram.sendMessage(
      ctx.chat!.id,
      `Добро пожаловать в <b>Spectre Boost</b>! 🎮\n\n${roleText}\n\n` +
        `Доступные команды:\n` +
        `/myorders — Мои заказы\n` +
        `/support — Обратиться в поддержку\n` +
        workerCmds +
        adminCmds,
      { parse_mode: 'HTML' },
    );
    return;
  }

  /**
   * /myorders — список заказов
   */
  @Command('myorders')
  async onMyOrders(@Ctx() ctx: Context) {
    const from = ctx.from;
    if (!from) return;

    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(from.id) },
    });

    if (!user) {
      await ctx.reply('Сначала зарегистрируйтесь: /start');
      return;
    }

    const whereClause =
      user.role === Role.WORKER
        ? { workerId: user.id, status: { in: [OrderStatus.ASSIGNED, OrderStatus.IN_PROGRESS] } }
        : { customerId: user.id };

    const orders = await this.prisma.order.findMany({
      where: whereClause,
      include: { service: { include: { gameCategory: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (orders.length === 0) {
      await ctx.reply('У вас пока нет заказов.');
      return;
    }

    const statusEmoji: Record<string, string> = {
      PENDING: '⏳',
      ASSIGNED: '👤',
      IN_PROGRESS: '🔄',
      COMPLETED: '✅',
      CANCELLED: '❌',
    };

    const text = orders
      .map(
        (o) =>
          `${statusEmoji[o.status] || '❓'} *#${o.id}* — ${o.service.name}\n` +
          `   💰 ${o.totalPrice} ₽ | ${o.status}`,
      )
      .join('\n\n');

    await ctx.reply(`📋 *Ваши заказы:*\n\n${text}`, {
      parse_mode: 'HTML',
    });
      return undefined;
  }

  /**
   * /status — статус работника
   */
  @Command('status')
  async onStatus(@Ctx() ctx: Context) {
    const from = ctx.from;
    if (!from) return;

    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(from.id) },
    });

    if (!user || user.role !== Role.WORKER) {
      await ctx.reply('Эта команда доступна только для бустеров.');
      return;
    }

    const activeOrders = await this.prisma.order.count({
      where: {
        workerId: user.id,
        status: { in: [OrderStatus.ASSIGNED, OrderStatus.IN_PROGRESS] },
      },
    });

    await ctx.reply(
      `👷 <b>Ваш статус:</b>\n\n` +
        `${user.isAvailable ? '🟢 Доступен' : '🔴 Недоступен'}\n` +
        `⭐ Рейтинг: ${user.rating}/5\n` +
        `📊 Выполнено: ${user.completedCount}\n` +
        `📦 Активных заказов: ${activeOrders}`,
      {
        parse_mode: 'HTML',
        reply_markup: availabilityKeyboard(user.isAvailable).reply_markup,
      },
    );
      return undefined;
  }

  /**
   * /available — переключить доступность
   */
  @Command('available')
  async onAvailable(@Ctx() ctx: Context) {
    const from = ctx.from;
    if (!from) return;

    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(from.id) },
    });

    if (!user || user.role !== Role.WORKER) {
      await ctx.reply('Эта команда доступна только для бустеров.');
      return;
    }

    const updated = await this.usersService.toggleWorkerAvailability(user.id);
    const status = updated.isAvailable ? '🟢 Доступен' : '🔴 Недоступен';

    await ctx.reply(`Статус изменён: ${status}`);
      return undefined;
  }

  /**
   * /support — обратиться в поддержку.
   * Rate limit: 1 обращение в 5 минут на юзера.
   * Можно: /support текст — сразу отправить
   * Или:   /support       — бот попросит описать + прикрепить фото
   */
  private supportCooldowns = new Map<number, number>();
  private pendingSupport = new Map<number, boolean>(); // telegramId → ожидает фото/текст
  private readonly SUPPORT_COOLDOWN_MS = 5 * 60 * 1000;

  @Command('support')
  async onSupport(@Ctx() ctx: Context) {
    const from = ctx.from;
    if (!from) return undefined;

    // Rate limit
    const lastSent = this.supportCooldowns.get(from.id);
    if (lastSent) {
      const elapsed = Date.now() - lastSent;
      if (elapsed < this.SUPPORT_COOLDOWN_MS) {
        const remaining = Math.ceil((this.SUPPORT_COOLDOWN_MS - elapsed) / 60000);
        await ctx.reply(
          `⏳ Вы недавно уже обращались в поддержку.\nПовторная отправка через ${remaining} мин.`,
        );
        return undefined;
      }
    }

    // @ts-ignore
    const text = ctx.message?.text || '';
    const message = text.replace('/support', '').trim();

    if (!message) {
      // Юзер ввёл просто /support — ждём сообщение или фото
      this.pendingSupport.set(from.id, true);
      await ctx.reply(
        `💬 <b>Поддержка Spectre Boost</b>\n\n` +
          `Опишите вашу проблему:\n` +
          `• Отправьте <b>текст</b> с описанием\n` +
          `• Или отправьте <b>фото</b> с подписью\n\n` +
          `Например:\n` +
          `<code>/support Бустер не выходит на связь по заказу #15</code>`,
        { parse_mode: 'HTML' },
      );
      return undefined;
    }

    if (message.length < 10) {
      await ctx.reply('❌ Слишком короткое сообщение. Опишите проблему подробнее (от 10 символов).');
      return undefined;
    }

    if (message.length > 1000) {
      await ctx.reply('❌ Слишком длинное сообщение. Максимум 1000 символов.');
      return undefined;
    }

    // Отправляем текстовый тикет
    await this.createSupportTicket(ctx, from, message, null);
    return undefined;
  }

  /**
   * Ловим фото — обработка в TelegramBotService через bot.on('photo')
   * (декораторы nestjs-telegraf для @On вызывают [object Object])
   */

  /**
   * Общий метод создания тикета — используется и для текста, и для фото
   */
  private async createSupportTicket(
    ctx: Context,
    from: { id: number; username?: string; first_name?: string },
    message: string,
    photoFileId: string | null,
  ) {
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

    // Сохраняем тикет в БД
    const ticket = await this.prisma.supportTicket.create({
      data: {
        message,
        photoFileId,
        userId: user.id,
      },
    });

    // Находим всех админов
    const admins = await this.prisma.user.findMany({
      where: { role: Role.ADMIN },
    });

    this.logger.log(`>>> Found ${admins.length} admin(s)`);

    if (admins.length === 0) {
      await ctx.reply('⚠️ Администраторы сейчас недоступны. Попробуйте позже.');
      return;
    }

    const ticketText =
      `🆘 <b>Тикет #${ticket.id}</b>${photoFileId ? ' 📷' : ''}\n\n` +
      `👤 От: ${this.esc(userName)} (ID: ${user.id})\n` +
      `💬 Сообщение:\n${this.esc(message)}\n\n` +
      `Ответить: <code>/reply ${ticket.id} текст ответа</code>`;

    // Короткий caption для фото (лимит Telegram — 1024 символа)
    const shortCaption =
      `🆘 Тикет #${ticket.id} 📷\n` +
      `От: ${this.esc(userName)}\n` +
      `→ /reply ${ticket.id} ответ`;

    // Отправляем обращение всем админам
    for (const admin of admins) {
      try {
        const adminChatId = admin.telegramId.toString();
        this.logger.log(`>>> Sending ticket #${ticket.id} to admin chatId=${adminChatId}`);

        if (photoFileId) {
          // Сначала фото с коротким caption
          await ctx.telegram.sendPhoto(
            adminChatId,
            photoFileId,
            { caption: shortCaption, parse_mode: 'HTML' },
          );
          // Потом полный текст отдельным сообщением
          await ctx.telegram.sendMessage(
            adminChatId,
            ticketText,
            { parse_mode: 'HTML' },
          );
        } else {
          await ctx.telegram.sendMessage(
            adminChatId,
            ticketText,
            { parse_mode: 'HTML' },
          );
        }
        this.logger.log(`>>> Ticket sent to admin successfully`);
      } catch (err) {
        this.logger.error(`Failed to send support msg to admin ${admin.telegramId}: ${err}`);
      }
    }

    this.supportCooldowns.set(from.id, Date.now());

    await ctx.reply(
      `✅ <b>Обращение #${ticket.id} отправлено!</b>\n\n` +
        `Наша команда ответит вам в ближайшее время.`,
      { parse_mode: 'HTML' },
    );
  }

  /**
   * /reply — ответ админа на тикет поддержки.
   * Формат: /reply ticketId текст ответа
   */
  @Command('reply')
  async onReply(@Ctx() ctx: Context) {
    const from = ctx.from;
    if (!from) return undefined;

    const admin = await this.getAdmin(from.id);
    if (!admin) {
      await ctx.reply('⛔ Доступ запрещён');
      return undefined;
    }

    // @ts-ignore
    const text = ctx.message?.text || '';
    const parts = text.split(' ');

    // /reply ticketId текст
    if (parts.length < 3) {
      await ctx.reply(
        `📖 <b>Использование:</b>\n\n` +
          `<code>/reply 5 Ваш ответ на обращение</code>\n\n` +
          `Где 5 — номер тикета из обращения.`,
        { parse_mode: 'HTML' },
      );
      return undefined;
    }

    const ticketId = parseInt(parts[1], 10);
    const replyText = parts.slice(2).join(' ');

    if (isNaN(ticketId)) {
      await ctx.reply('❌ Неверный номер тикета');
      return undefined;
    }

    // Находим тикет
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { user: true },
    });

    if (!ticket) {
      await ctx.reply('❌ Тикет не найден');
      return undefined;
    }

    // Обновляем тикет в БД
    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'ANSWERED',
        reply: replyText,
        repliedAt: new Date(),
        adminId: admin.id,
      },
    });

    try {
      await ctx.telegram.sendMessage(
        ticket.user.telegramId.toString(),
        `💬 <b>Ответ от поддержки (тикет #${ticketId})</b>\n\n${this.esc(replyText)}`,
        { parse_mode: 'HTML' },
      );

      await ctx.reply(`✅ Ответ отправлен, тикет #${ticketId} закрыт`);
    } catch (err: any) {
      await ctx.reply(`❌ Не удалось отправить: ${err.message || 'Ошибка'}`);
    }
    return undefined;
  }

  // ─── Callback handlers ───

  /**
   * Принять заказ
   */
  @Action(/accept_order_(\d+)/)
  async onAcceptOrder(@Ctx() ctx: Context) {
    const from = ctx.from;
    if (!from) return;

    // @ts-ignore — доступ к match из callback query
    const match = ctx.match;
    const orderId = parseInt(match[1], 10);

    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(from.id) },
    });

    if (!user || user.role !== Role.WORKER) {
      await ctx.answerCbQuery('Только бустеры могут принимать заказы');
      return;
    }

    try {
      await this.ordersService.assignWorker(orderId, user.id);
      await ctx.answerCbQuery('✅ Заказ принят!');
      await ctx.editMessageText(
        `✅ <b>Заказ #${orderId} принят!</b>\n\nОжидайте связи с покупателем.`,
        { parse_mode: 'HTML' },
      );
    } catch (err: any) {
      await ctx.answerCbQuery(err.message || 'Ошибка');
    }
      return undefined;
  }

  /**
   * Отклонить заказ — перераспределить следующему работнику
   */
  @Action(/reject_order_(\d+)/)
  async onRejectOrder(@Ctx() ctx: Context) {
    const from = ctx.from;
    if (!from) return undefined;

    // @ts-ignore
    const orderId = parseInt(ctx.match[1], 10);

    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(from.id) },
    });

    if (!user) return undefined;

    await ctx.answerCbQuery('Заказ отклонён');
    await ctx.editMessageText(`❌ Заказ #${orderId} отклонён.`);

    // Сохраняем ID отклонившего в заказ
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        service: { include: { gameCategory: true } },
        customer: true,
      },
    });

    if (!order || order.status !== 'PENDING') return undefined;

    // Добавляем ID в rejectedByIds
    const currentRejected = (order.rejectedByIds as number[]) || [];
    const updatedRejected = [...currentRejected, user.id];

    await this.prisma.order.update({
      where: { id: orderId },
      data: { rejectedByIds: updatedRejected },
    });

    this.logger.log(
      `Worker #${user.id} rejected order #${orderId}. Rejected by: [${updatedRejected.join(', ')}]`,
    );

    // Перераспределяем — ищем следующего, исключая отклонивших
    // Импортируем TelegramBotService через ModuleRef чтобы избежать circular dep
    // Или проще — напрямую вызываем метод из service
    const botService = this.botService;
    if (botService) {
      await botService.distributeOrderToWorkers(order, updatedRejected);
    }

    return undefined;
  }

  /**
   * Начать выполнение заказа (ASSIGNED → IN_PROGRESS)
   */
  @Action(/start_order_(\d+)/)
  async onStartOrder(@Ctx() ctx: Context) {
    const from = ctx.from;
    if (!from) return;

    // @ts-ignore
    const orderId = parseInt(ctx.match[1], 10);

    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(from.id) },
    });

    if (!user) return;

    try {
      await this.ordersService.updateStatus(
        orderId,
        OrderStatus.IN_PROGRESS,
        user.id,
        user.role,
      );
      await ctx.answerCbQuery('🚀 Выполнение начато!');
      await ctx.editMessageText(
        `🔄 <b>Заказ #${orderId} — в работе!</b>\n\nВы приступили к выполнению.`,
        { parse_mode: 'HTML' },
      );
    } catch (err: any) {
      await ctx.answerCbQuery(err.message || 'Ошибка');
    }
      return undefined;
  }

  /**
   * Завершить заказ (IN_PROGRESS → COMPLETED)
   */
  @Action(/complete_order_(\d+)/)
  async onCompleteOrder(@Ctx() ctx: Context) {
    const from = ctx.from;
    if (!from) return;

    // @ts-ignore
    const orderId = parseInt(ctx.match[1], 10);

    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(from.id) },
    });

    if (!user) return;

    try {
      await this.ordersService.updateStatus(
        orderId,
        OrderStatus.COMPLETED,
        user.id,
        user.role,
      );
      await ctx.answerCbQuery('✅ Заказ завершён!');
      await ctx.editMessageText(
        `✅ <b>Заказ #${orderId} завершён!</b>\n\nСпасибо за работу!`,
        { parse_mode: 'HTML' },
      );
    } catch (err: any) {
      await ctx.answerCbQuery(err.message || 'Ошибка');
    }
      return undefined;
  }

  /**
   * Переключить доступность (inline кнопка)
   */
  @Action('toggle_availability')
  async onToggleAvailability(@Ctx() ctx: Context) {
    const from = ctx.from;
    if (!from) return;

    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(from.id) },
    });

    if (!user || user.role !== Role.WORKER) return;

    const updated = await this.usersService.toggleWorkerAvailability(user.id);
    const status = updated.isAvailable ? '🟢 Доступен' : '🔴 Недоступен';

    await ctx.answerCbQuery(`Статус: ${status}`);
      return undefined;
  }

  /**
   * Шаг 1: Покупатель нажимает звёзды
   * Покупатель нажимает звёзды — сразу создаём отзыв.
   * Текст отзыва можно добавить на сайте.
   */
  @Action(/rate_(\d+)_(\d+)/)
  async onRate(@Ctx() ctx: Context) {
    const from = ctx.from;
    if (!from) return;

    // @ts-ignore
    const orderId = parseInt(ctx.match[1], 10);
    // @ts-ignore
    const rating = parseInt(ctx.match[2], 10);

    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(from.id) },
    });

    if (!user) return;

    try {
      // Создаём отзыв с дефолтным текстом
      const stars = '⭐'.repeat(rating);
      const defaultText = `Оценка ${rating}/5 из Telegram`;

      await this.reviewsService.create(user.id, {
        orderId,
        rating,
        text: defaultText,
      });

      await ctx.answerCbQuery(`${stars} Спасибо!`);
      await ctx.editMessageText(
        `🎉 <b>Заказ #${orderId} — завершён!</b>\n\n` +
          `Ваша оценка: ${stars} (${rating}/5)\n\n` +
          `✅ Отзыв отправлен на модерацию.\n` +
          `Добавить текст к отзыву можно на сайте в личном кабинете.`,
        { parse_mode: 'HTML' },
      );
    } catch (err: any) {
      await ctx.answerCbQuery(err.message || 'Ошибка');
    }
      return undefined;
  }

  /** Экранирование HTML */
  private esc(text: string): string {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /** Проверка что юзер — админ */
  private async getAdmin(telegramId: number) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });
    if (!user || user.role !== Role.ADMIN) return null;
    return user;
  }

  // ═══════════════════════════════════════
  //  АДМИН-КОМАНДЫ
  // ═══════════════════════════════════════

  /**
   * /reviews — отзывы на модерацию
   */
  @Command('reviews')
  async onAdminReviews(@Ctx() ctx: Context) {
    if (!ctx.from) return;
    const admin = await this.getAdmin(ctx.from.id);
    if (!admin) {
      await ctx.reply('⛔ Доступ запрещён');
      return;
    }

    const reviews = await this.prisma.review.findMany({
      where: { status: 'PENDING' },
      include: {
        author: true,
        order: { include: { service: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (reviews.length === 0) {
      await ctx.reply('✅ Нет отзывов на модерацию.');
      return;
    }

    for (const review of reviews) {
      const authorName = review.author.username
        ? `@${this.esc(review.author.username)}`
        : this.esc(review.author.firstName || 'Аноним');

      const stars = '⭐'.repeat(review.rating);

      await ctx.reply(
        `📝 <b>Отзыв #${review.id}</b>\n\n` +
          `👤 Автор: ${authorName}\n` +
          `${stars} (${review.rating}/5)\n` +
          `📌 Заказ #${review.orderId} — ${this.esc(review.order.service.name)}\n\n` +
          `"${this.esc(review.text)}"`,
        {
          parse_mode: 'HTML',
          reply_markup: reviewModerationKeyboard(review.id).reply_markup,
        },
      );
    }
      return undefined;
  }

  /**
   * /workers — список бустеров
   */
  @Command('workers')
  async onAdminWorkers(@Ctx() ctx: Context) {
    if (!ctx.from) return;
    const admin = await this.getAdmin(ctx.from.id);
    if (!admin) {
      await ctx.reply('⛔ Доступ запрещён');
      return;
    }

    const workers = await this.prisma.user.findMany({
      where: { role: Role.WORKER },
      include: {
        _count: {
          select: {
            assignedTasks: { where: { status: { in: ['ASSIGNED', 'IN_PROGRESS'] } } },
          },
        },
      },
      orderBy: { rating: 'desc' },
    });

    if (workers.length === 0) {
      await ctx.reply('Бустеров пока нет.');
      return;
    }

    for (const worker of workers) {
      const name = worker.username
        ? `@${this.esc(worker.username)}`
        : this.esc(worker.firstName || `ID ${worker.id}`);

      const status = worker.isAvailable ? '🟢 Доступен' : '🔴 Недоступен';
      const active = worker._count.assignedTasks;

      const text =
        `👷 <b>${name}</b>\n\n` +
        `${status}\n` +
        `⭐ Рейтинг: ${worker.rating}/5\n` +
        `📊 Выполнено: ${worker.completedCount}\n` +
        `📦 Активных: ${active}`;

      await ctx.replyWithHTML(text, workerManageKeyboard(worker.id, worker.isAvailable));
    }
      return undefined;
  }

  /**
   * /orders — последние заказы
   */
  @Command('orders')
  async onAdminOrders(@Ctx() ctx: Context) {
    if (!ctx.from) return;
    const admin = await this.getAdmin(ctx.from.id);
    if (!admin) {
      await ctx.reply('⛔ Доступ запрещён');
      return;
    }

    const orders = await this.prisma.order.findMany({
      include: {
        customer: true,
        worker: true,
        service: { include: { gameCategory: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (orders.length === 0) {
      await ctx.reply('Заказов пока нет.');
      return;
    }

    const statusEmoji: Record<string, string> = {
      PENDING: '⏳', ASSIGNED: '👤', IN_PROGRESS: '🔄',
      COMPLETED: '✅', CANCELLED: '❌',
    };

    const lines = orders.map((o) => {
      const customer = o.customer.username
        ? `@${this.esc(o.customer.username)}`
        : this.esc(o.customer.firstName || '?');
      const worker = o.worker
        ? (o.worker.username ? `@${this.esc(o.worker.username)}` : this.esc(o.worker.firstName || '?'))
        : '—';

      return (
        `${statusEmoji[o.status] || '❓'} <b>#${o.id}</b> ${this.esc(o.service.name)}\n` +
        `   👤 ${customer} → 👷 ${worker}\n` +
        `   💰 ${o.totalPrice} ₽ | ${o.status}`
      );
    });

    await ctx.reply(
      `📋 <b>Последние заказы:</b>\n\n${lines.join('\n\n')}`,
      { parse_mode: 'HTML' },
    );
      return undefined;
  }

  /**
   * /stats — общая статистика
   */
  @Command('stats')
  async onAdminStats(@Ctx() ctx: Context) {
    if (!ctx.from) return;
    const admin = await this.getAdmin(ctx.from.id);
    if (!admin) {
      await ctx.reply('⛔ Доступ запрещён');
      return;
    }

    const [totalOrders, completedOrders, pendingOrders, activeOrders, totalWorkers, availableWorkers, pendingReviewsCount, totalRevenue] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'COMPLETED' } }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: { in: ['ASSIGNED', 'IN_PROGRESS'] } } }),
      this.prisma.user.count({ where: { role: 'WORKER' } }),
      this.prisma.user.count({ where: { role: 'WORKER', isAvailable: true } }),
      this.prisma.review.count({ where: { status: 'PENDING' } }),
      this.prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalPrice: true },
      }),
    ]);

    const revenue = totalRevenue._sum.totalPrice || 0;

    await ctx.reply(
      `📊 <b>Статистика Spectre Boost</b>\n\n` +
        `📦 Заказов всего: ${totalOrders}\n` +
        `✅ Завершено: ${completedOrders}\n` +
        `⏳ Ожидают: ${pendingOrders}\n` +
        `🔄 В работе: ${activeOrders}\n\n` +
        `👷 Бустеров: ${totalWorkers} (доступных: ${availableWorkers})\n` +
        `📝 Отзывов на модерацию: ${pendingReviewsCount}\n\n` +
        `💰 Выручка: ${revenue.toLocaleString('ru-RU')} ₽`,
      { parse_mode: 'HTML' },
    );
      return undefined;
  }

  /**
   * /tickets — неотвеченные тикеты поддержки (ADMIN)
   */
  @Command('tickets')
  async onAdminTickets(@Ctx() ctx: Context) {
    if (!ctx.from) return undefined;
    const admin = await this.getAdmin(ctx.from.id);
    if (!admin) {
      await ctx.reply('⛔ Доступ запрещён');
      return undefined;
    }

    const openTickets = await this.prisma.supportTicket.findMany({
      where: { status: 'OPEN' },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
      take: 15,
    });

    if (openTickets.length === 0) {
      await ctx.reply('✅ Нет неотвеченных обращений.');
      return undefined;
    }

    const totalOpen = await this.prisma.supportTicket.count({
      where: { status: 'OPEN' },
    });

    const lines = openTickets.map((t: any) => {
      const name = t.user.username
        ? `@${this.esc(t.user.username)}`
        : this.esc(t.user.firstName || `ID ${t.user.id}`);
      const date = new Date(t.createdAt).toLocaleString('ru-RU', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      });
      const shortMsg = t.message.length > 60
        ? this.esc(t.message.substring(0, 60)) + '...'
        : this.esc(t.message);
      const photoIcon = t.photoFileId ? ' 📷' : '';

      return `🔹 <b>#${t.id}</b>${photoIcon} | ${name} | ${date}\n   ${shortMsg}\n   → <code>/ticket ${t.id}</code> | <code>/reply ${t.id} ответ</code>`;
    });

    await ctx.reply(
      `📋 <b>Неотвеченные обращения (${totalOpen})</b>\n\n${lines.join('\n\n')}`,
      { parse_mode: 'HTML' },
    );
    return undefined;
  }

  /**
   * /ticket ID — открыть конкретный тикет (с фото если есть)
   */
  @Command('ticket')
  async onAdminTicket(@Ctx() ctx: Context) {
    if (!ctx.from) return undefined;
    const admin = await this.getAdmin(ctx.from.id);
    if (!admin) {
      await ctx.reply('⛔ Доступ запрещён');
      return undefined;
    }

    // @ts-ignore
    const text = ctx.message?.text || '';
    const parts = text.split(' ');

    if (parts.length < 2) {
      await ctx.reply(
        `📖 <b>Использование:</b>\n<code>/ticket 5</code> — открыть тикет #5`,
        { parse_mode: 'HTML' },
      );
      return undefined;
    }

    const ticketId = parseInt(parts[1], 10);
    if (isNaN(ticketId)) {
      await ctx.reply('❌ Неверный номер тикета');
      return undefined;
    }

    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { user: true },
    });

    if (!ticket) {
      await ctx.reply('❌ Тикет не найден');
      return undefined;
    }

    const name = ticket.user.username
      ? `@${this.esc(ticket.user.username)}`
      : this.esc(ticket.user.firstName || `ID ${ticket.user.id}`);

    const date = new Date(ticket.createdAt).toLocaleString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const statusMap: Record<string, string> = {
      OPEN: '🔴 Открыт',
      ANSWERED: '🟢 Отвечен',
      CLOSED: '⚪ Закрыт',
    };
    const status = statusMap[ticket.status] || ticket.status;

    let ticketText =
      `📋 <b>Тикет #${ticket.id}</b>\n\n` +
      `📌 Статус: ${status}\n` +
      `👤 От: ${name} (ID: ${ticket.userId})\n` +
      `📅 Дата: ${date}\n\n` +
      `💬 <b>Сообщение:</b>\n${this.esc(ticket.message)}`;

    if (ticket.reply) {
      ticketText += `\n\n✅ <b>Ответ:</b>\n${this.esc(ticket.reply)}`;
    } else {
      ticketText += `\n\n→ <code>/reply ${ticket.id} ваш ответ</code>`;
    }

    // Если есть фото — фото + текст отдельно
    if (ticket.photoFileId) {
      await ctx.replyWithPhoto(ticket.photoFileId, {
        caption: `📷 Фото к тикету #${ticket.id}`,
      });
      await ctx.reply(ticketText, { parse_mode: 'HTML' });
    } else {
      await ctx.reply(ticketText, { parse_mode: 'HTML' });
    }

    return undefined;
  }

  /**
   * /chat orderId — просмотр переписки по заказу (ADMIN)
   * Показывает текст + отправляет фото/документы/голосовые
   */
  @Command('chat')
  async onAdminChat(@Ctx() ctx: Context) {
    if (!ctx.from) return undefined;
    const admin = await this.getAdmin(ctx.from.id);
    if (!admin) {
      await ctx.reply('⛔ Доступ запрещён');
      return undefined;
    }

    // @ts-ignore
    const text = ctx.message?.text || '';
    const parts = text.split(' ');

    if (parts.length < 2) {
      await ctx.reply(
        `📖 <b>Использование:</b>\n<code>/chat 15</code> — переписка по заказу #15`,
        { parse_mode: 'HTML' },
      );
      return undefined;
    }

    const orderId = parseInt(parts[1], 10);
    if (isNaN(orderId)) {
      await ctx.reply('❌ Неверный номер заказа');
      return undefined;
    }

    const messages = await this.prisma.chatMessage.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    if (messages.length === 0) {
      await ctx.reply(`💬 Заказ #${orderId} — переписка пуста.`);
      return undefined;
    }

    await ctx.reply(
      `💬 <b>Чат заказа #${orderId}</b> (${messages.length} сообщений)`,
      { parse_mode: 'HTML' },
    );

    // Отправляем сообщения по порядку
    for (const m of messages as any[]) {
      const role = m.senderRole === 'CUSTOMER' ? '👤' : '👷';
      const time = new Date(m.createdAt).toLocaleTimeString('ru-RU', {
        hour: '2-digit', minute: '2-digit',
      });
      const prefix = `${time} ${role}`;

      try {
        if (m.fileId && m.fileType) {
          const caption = m.text
            ? `${prefix}: ${decrypt(m.text)}`
            : prefix;

          switch (m.fileType) {
            case 'photo':
              await ctx.replyWithPhoto(m.fileId, { caption });
              break;
            case 'document':
              await ctx.replyWithDocument(m.fileId, { caption });
              break;
            case 'voice':
              await ctx.replyWithVoice(m.fileId, { caption });
              break;
            case 'video':
              await ctx.replyWithVideo(m.fileId, { caption });
              break;
            case 'sticker':
              await ctx.reply(prefix);
              await ctx.replyWithSticker(m.fileId);
              break;
            case 'video_note':
              await ctx.reply(prefix);
              await ctx.replyWithVideoNote(m.fileId);
              break;
            default:
              await ctx.reply(`${prefix}: [${m.fileType}]`);
          }
        } else if (m.text) {
          await ctx.reply(`${prefix}: ${decrypt(m.text)}`);
        }
      } catch (err) {
        this.logger.error(`Failed to send chat message to admin: ${err}`);
        const fallback = m.text ? decrypt(m.text) : `[${m.fileType || '?'}]`;
        await ctx.reply(`${prefix}: ${fallback} ⚠️`);
      }
    }

    return undefined;
  }

  /**
   * /promo — управление промокодами (ADMIN)
   * /promo create CODE 15 @blogger   — создать (скидка 15%)
   * /promo create CODE 10 @blogger 100 — создать с лимитом 100 использований
   * /promo list                        — список всех
   * /promo disable CODE               — отключить
   * /promo enable CODE                — включить
   */
  @Command('promo')
  async onPromo(@Ctx() ctx: Context) {
    if (!ctx.from) return undefined;
    const admin = await this.getAdmin(ctx.from.id);
    if (!admin) {
      await ctx.reply('⛔ Доступ запрещён');
      return undefined;
    }

    // @ts-ignore
    const text = ctx.message?.text || '';
    const parts = text.split(' ').filter(Boolean);
    const action = parts[1]?.toLowerCase();

    if (!action || action === 'help') {
      await ctx.reply(
        `🏷 <b>Управление промокодами</b>\n\n` +
          `<code>/promo create CODE 15 @blogger</code> — создать (скидка 15%)\n` +
          `<code>/promo create CODE 10 @blogger 100</code> — с лимитом 100\n` +
          `<code>/promo list</code> — список всех\n` +
          `<code>/promo disable CODE</code> — отключить\n` +
          `<code>/promo enable CODE</code> — включить`,
        { parse_mode: 'HTML' },
      );
      return undefined;
    }

    // /promo create CODE DISCOUNT INFLUENCER [MAX_USES]
    if (action === 'create') {
      const code = parts[2]?.toUpperCase();
      const discount = parseInt(parts[3], 10);
      const influencer = parts[4];
      const maxUses = parts[5] ? parseInt(parts[5], 10) : undefined;

      if (!code || !discount || !influencer) {
        await ctx.reply('❌ Формат: <code>/promo create CODE 15 @blogger</code>', { parse_mode: 'HTML' });
        return undefined;
      }

      try {
        const promo = await this.promoService.create(code, discount, influencer, maxUses);
        await ctx.reply(
          `✅ <b>Промокод создан!</b>\n\n` +
            `🏷 Код: <code>${promo.code}</code>\n` +
            `💰 Скидка: ${promo.discount}%\n` +
            `👤 Инфлюенсер: ${this.esc(promo.influencer)}\n` +
            `📊 Лимит: ${promo.maxUses || 'безлимит'}\n\n` +
            `Ссылка: <code>spectre.com/?promo=${promo.code}</code>`,
          { parse_mode: 'HTML' },
        );
      } catch (err: any) {
        await ctx.reply(`❌ ${err.message}`);
      }
      return undefined;
    }

    // /promo list
    if (action === 'list') {
      const promos = await this.promoService.findAll();

      if (promos.length === 0) {
        await ctx.reply('Промокодов пока нет.');
        return undefined;
      }

      const lines = promos.map((p: any) => {
        const status = p.isActive ? '🟢' : '🔴';
        const limit = p.maxUses ? `${p.usageCount}/${p.maxUses}` : `${p.usageCount}/∞`;
        return `${status} <code>${p.code}</code> — ${p.discount}% | ${this.esc(p.influencer)} | ${limit}`;
      });

      await ctx.reply(
        `🏷 <b>Промокоды (${promos.length})</b>\n\n${lines.join('\n')}`,
        { parse_mode: 'HTML' },
      );
      return undefined;
    }

    // /promo disable CODE
    if (action === 'disable') {
      const code = parts[2]?.toUpperCase();
      if (!code) {
        await ctx.reply('❌ Укажите код: <code>/promo disable CODE</code>', { parse_mode: 'HTML' });
        return undefined;
      }
      try {
        await this.promoService.disable(code);
        await ctx.reply(`🔴 Промокод <code>${code}</code> отключён`, { parse_mode: 'HTML' });
      } catch (err: any) {
        await ctx.reply(`❌ ${err.message}`);
      }
      return undefined;
    }

    // /promo enable CODE
    if (action === 'enable') {
      const code = parts[2]?.toUpperCase();
      if (!code) {
        await ctx.reply('❌ Укажите код: <code>/promo enable CODE</code>', { parse_mode: 'HTML' });
        return undefined;
      }
      try {
        await this.promoService.enable(code);
        await ctx.reply(`🟢 Промокод <code>${code}</code> активирован`, { parse_mode: 'HTML' });
      } catch (err: any) {
        await ctx.reply(`❌ ${err.message}`);
      }
      return undefined;
    }

    await ctx.reply('❌ Неизвестная команда. Используйте <code>/promo help</code>', { parse_mode: 'HTML' });
    return undefined;
  }

  /**
   * /setrole — назначить роль
   * Формат: /setrole @username WORKER
   */
  @Command('setrole')
  async onSetRole(@Ctx() ctx: Context) {
    if (!ctx.from) return;
    const admin = await this.getAdmin(ctx.from.id);
    if (!admin) {
      await ctx.reply('⛔ Доступ запрещён');
      return;
    }

    // @ts-ignore
    const text = ctx.message?.text || '';
    const parts = text.split(' ').filter(Boolean);

    // /setrole @username ROLE
    if (parts.length < 3) {
      await ctx.reply(
        '📖 <b>Использование:</b>\n\n' +
          '<code>/setrole @username WORKER</code>\n' +
          '<code>/setrole @username CUSTOMER</code>\n' +
          '<code>/setrole @username ADMIN</code>',
        { parse_mode: 'HTML' },
      );
      return;
    }

    const username = parts[1].replace('@', '');
    const role = parts[2].toUpperCase();

    if (!['CUSTOMER', 'WORKER', 'ADMIN'].includes(role)) {
      await ctx.reply('❌ Роль должна быть: CUSTOMER, WORKER или ADMIN');
      return;
    }

    const user = await this.prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
    });

    if (!user) {
      await ctx.reply(`❌ Пользователь @${this.esc(username)} не найден. Он должен сначала написать /start боту.`);
      return;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { role: role as Role },
    });

    await ctx.reply(
      `✅ Роль @${this.esc(username)} изменена на <b>${role}</b>`,
      { parse_mode: 'HTML' },
    );
      return undefined;
  }

  // ─── Админские callback handlers ───

  /**
   * Одобрить отзыв
   */
  @Action(/approve_review_(\d+)/)
  async onApproveReview(@Ctx() ctx: Context) {
    if (!ctx.from) return;
    const admin = await this.getAdmin(ctx.from.id);
    if (!admin) {
      await ctx.answerCbQuery('⛔ Доступ запрещён');
      return;
    }

    // @ts-ignore
    const reviewId = parseInt(ctx.match[1], 10);

    try {
      await this.reviewsService.approve(reviewId);
      await ctx.answerCbQuery('✅ Одобрен!');
      await ctx.editMessageText(
        ctx.callbackQuery?.message && 'text' in ctx.callbackQuery.message
          ? ctx.callbackQuery.message.text + '\n\n✅ ОДОБРЕН'
          : `✅ Отзыв #${reviewId} одобрен`,
      );
    } catch (err: any) {
      await ctx.answerCbQuery(err.message || 'Ошибка');
    }
      return undefined;
  }

  /**
   * Отклонить отзыв
   */
  @Action(/reject_review_(\d+)/)
  async onRejectReview(@Ctx() ctx: Context) {
    if (!ctx.from) return;
    const admin = await this.getAdmin(ctx.from.id);
    if (!admin) {
      await ctx.answerCbQuery('⛔ Доступ запрещён');
      return;
    }

    // @ts-ignore
    const reviewId = parseInt(ctx.match[1], 10);

    try {
      await this.reviewsService.reject(reviewId);
      await ctx.answerCbQuery('❌ Отклонён!');
      await ctx.editMessageText(
        ctx.callbackQuery?.message && 'text' in ctx.callbackQuery.message
          ? ctx.callbackQuery.message.text + '\n\n❌ ОТКЛОНЁН'
          : `❌ Отзыв #${reviewId} отклонён`,
      );
    } catch (err: any) {
      await ctx.answerCbQuery(err.message || 'Ошибка');
    }
      return undefined;
  }

  /**
   * Вкл/выкл работника
   */
  @Action(/admin_toggle_worker_(\d+)/)
  async onAdminToggleWorker(@Ctx() ctx: Context) {
    if (!ctx.from) return;
    const admin = await this.getAdmin(ctx.from.id);
    if (!admin) {
      await ctx.answerCbQuery('⛔ Доступ запрещён');
      return;
    }

    // @ts-ignore
    const userId = parseInt(ctx.match[1], 10);

    try {
      const updated = await this.usersService.toggleWorkerAvailability(userId);
      const status = updated.isAvailable ? '🟢 Доступен' : '🔴 Недоступен';
      await ctx.answerCbQuery(`${status}`);
    } catch (err: any) {
      await ctx.answerCbQuery(err.message || 'Ошибка');
    }
      return undefined;
  }

  /**
   * Понизить до CUSTOMER
   */
  @Action(/admin_demote_(\d+)/)
  async onAdminDemote(@Ctx() ctx: Context) {
    if (!ctx.from) return;
    const admin = await this.getAdmin(ctx.from.id);
    if (!admin) {
      await ctx.answerCbQuery('⛔ Доступ запрещён');
      return;
    }

    // @ts-ignore
    const userId = parseInt(ctx.match[1], 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.CUSTOMER },
    });

    await ctx.answerCbQuery('✅ Роль изменена на CUSTOMER');
      return undefined;
  }

  /**
   * Повысить до WORKER
   */
  @Action(/admin_promote_(\d+)/)
  async onAdminPromote(@Ctx() ctx: Context) {
    if (!ctx.from) return;
    const admin = await this.getAdmin(ctx.from.id);
    if (!admin) {
      await ctx.answerCbQuery('⛔ Доступ запрещён');
      return;
    }

    // @ts-ignore
    const userId = parseInt(ctx.match[1], 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.WORKER },
    });

    await ctx.answerCbQuery('✅ Роль изменена на WORKER');
      return undefined;
  }
}
