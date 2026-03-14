import { Markup } from 'telegraf';

/**
 * Клавиатура для работника: принять/отклонить заказ
 */
export function orderActionKeyboard(orderId: number) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Принять', `accept_order_${orderId}`),
      Markup.button.callback('❌ Отклонить', `reject_order_${orderId}`),
    ],
  ]);
}

/**
 * Клавиатура для работника: начать выполнение (ASSIGNED → IN_PROGRESS)
 */
export function orderStartKeyboard(orderId: number) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🚀 Начать выполнение', `start_order_${orderId}`)],
  ]);
}

/**
 * Клавиатура для работника: завершить заказ (IN_PROGRESS → COMPLETED)
 */
export function orderCompleteKeyboard(orderId: number) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✅ Завершить заказ', `complete_order_${orderId}`)],
  ]);
}

/**
 * Клавиатура для работника: переключить доступность
 */
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

/**
 * Контакт работника для покупателя
 */
export function workerContactKeyboard(workerUsername: string) {
  return Markup.inlineKeyboard([
    [
      Markup.button.url(
        '💬 Написать бустеру',
        `https://t.me/${workerUsername}`,
      ),
    ],
  ]);
}
