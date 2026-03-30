/**
 * ДОБАВЬ В telegram-bot.update.ts:
 *
 * 1. Импорт AuthService:
 *    import { AuthService } from '../auth/auth.service';
 *
 * 2. Добавь в constructor:
 *    private readonly authService: AuthService,
 *
 * 3. Добавь эту команду после @Start():
 */

  /**
   * /login CODE — авторизация на сайте через бота.
   * Юзер видит код на сайте → пишет боту /login 123456 → авторизован.
   */
  @Command('login')
  async onLogin(@Ctx() ctx: Context) {
    const from = ctx.from;
    if (!from) return undefined;

    // @ts-ignore
    const text = ctx.message?.text || '';
    const parts = text.split(' ');

    if (parts.length < 2) {
      await ctx.reply(
        '🔐 <b>Авторизация на сайте</b>\n\n' +
        'Введите код с сайта:\n' +
        '<code>/login 123456</code>',
        { parse_mode: 'HTML' },
      );
      return undefined;
    }

    const code = parts[1].trim();

    if (!/^\d{6}$/.test(code)) {
      await ctx.reply('❌ Код должен содержать 6 цифр.');
      return undefined;
    }

    // Обновляем данные юзера
    await this.prisma.user.upsert({
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

    const confirmed = await this.authService.confirmLoginCode(
      code,
      BigInt(from.id),
    );

    if (confirmed) {
      await ctx.reply(
        '✅ <b>Авторизация успешна!</b>\n\n' +
        'Вернитесь на сайт — вы уже вошли.',
        { parse_mode: 'HTML' },
      );
    } else {
      await ctx.reply(
        '❌ Код недействителен или истёк.\n' +
        'Получите новый код на сайте.',
      );
    }

    return undefined;
  }
