import { Logger } from '@nestjs/common';
import { Update, Start, Command, Action, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { availabilityKeyboard } from './keyboards/inline-keyboards';
import { Role, OrderStatus } from '@prisma/client';

@Update()
export class TelegramBotUpdate {
  private readonly logger = new Logger(TelegramBotUpdate.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
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

    await ctx.reply(
      `Добро пожаловать в *Spectre Boost*! 🎮\n\n${roleText}\n\n` +
        `Доступные команды:\n` +
        `/myorders — Мои заказы\n` +
        (user.role === Role.WORKER
          ? `/status — Мой статус\n/available — Переключить доступность\n`
          : ''),
      { parse_mode: 'Markdown' },
    );
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
      parse_mode: 'Markdown',
    });
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
      `👷 *Ваш статус:*\n\n` +
        `${user.isAvailable ? '🟢 Доступен' : '🔴 Недоступен'}\n` +
        `⭐ Рейтинг: ${user.rating}/5\n` +
        `📊 Выполнено: ${user.completedCount}\n` +
        `📦 Активных заказов: ${activeOrders}`,
      {
        parse_mode: 'Markdown',
        ...availabilityKeyboard(user.isAvailable),
      },
    );
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
        `✅ *Заказ #${orderId} принят!*\n\nОжидайте связи с покупателем.`,
        { parse_mode: 'Markdown' },
      );
    } catch (err: any) {
      await ctx.answerCbQuery(err.message || 'Ошибка');
    }
  }

  /**
   * Отклонить заказ
   */
  @Action(/reject_order_(\d+)/)
  async onRejectOrder(@Ctx() ctx: Context) {
    // @ts-ignore
    const orderId = parseInt(ctx.match[1], 10);

    await ctx.answerCbQuery('Заказ отклонён');
    await ctx.editMessageText(`❌ Заказ #${orderId} отклонён.`);

    // TODO: Отправить заказ следующему работнику
    this.logger.log(`Worker rejected order #${orderId}, need to redistribute`);
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
        `🔄 *Заказ #${orderId} — в работе!*\n\nВы приступили к выполнению.`,
        { parse_mode: 'Markdown' },
      );
    } catch (err: any) {
      await ctx.answerCbQuery(err.message || 'Ошибка');
    }
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
        `✅ *Заказ #${orderId} завершён!*\n\nСпасибо за работу!`,
        { parse_mode: 'Markdown' },
      );
    } catch (err: any) {
      await ctx.answerCbQuery(err.message || 'Ошибка');
    }
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
  }
}
