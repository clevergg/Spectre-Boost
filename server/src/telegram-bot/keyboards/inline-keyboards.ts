import { Markup } from 'telegraf';

// ─── Работник ───

export function orderActionKeyboard(orderId: number) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Принять', `accept_order_${orderId}`),
      Markup.button.callback('❌ Отклонить', `reject_order_${orderId}`),
    ],
  ]);
}

export function orderStartKeyboard(orderId: number) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🚀 Начать выполнение', `start_order_${orderId}`)],
  ]);
}

export function orderCompleteKeyboard(orderId: number) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✅ Завершить заказ', `complete_order_${orderId}`)],
  ]);
}

export function availabilityKeyboard(isAvailable: boolean) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        isAvailable ? '🔴 Стать недоступным' : '🟢 Стать доступным',
        'toggle_availability',
      ),
    ],
  ]);
}

// ─── Покупатель ───

export function workerContactKeyboard(workerUsername: string) {
  return Markup.inlineKeyboard([
    [Markup.button.url('💬 Написать бустеру', `https://t.me/${workerUsername}`)],
  ]);
}

export function ratingKeyboard(orderId: number) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('⭐ 1', `rate_${orderId}_1`),
      Markup.button.callback('⭐ 2', `rate_${orderId}_2`),
      Markup.button.callback('⭐ 3', `rate_${orderId}_3`),
      Markup.button.callback('⭐ 4', `rate_${orderId}_4`),
      Markup.button.callback('⭐ 5', `rate_${orderId}_5`),
    ],
  ]);
}

// ─── Админ ───

export function reviewModerationKeyboard(reviewId: number) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Одобрить', `approve_review_${reviewId}`),
      Markup.button.callback('❌ Отклонить', `reject_review_${reviewId}`),
    ],
  ]);
}

export function workerManageKeyboard(userId: number, isAvailable: boolean) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        isAvailable ? '🔴 Отключить' : '🟢 Включить',
        `admin_toggle_worker_${userId}`,
      ),
      Markup.button.callback('🔄 Сделать CUSTOMER', `admin_demote_${userId}`),
    ],
  ]);
}
