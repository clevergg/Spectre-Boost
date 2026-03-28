/**
 * Support — страница поддержки в личном кабинете.
 * FAQ + ссылка на бота для обращения в поддержку.
 */

import { useState } from "react"
import { SupportTitle } from "../components/OrdersTitle"

interface FaqItem {
  question: string
  answer: string
}

/**const FAQ_DATA: FaqItem[] = [
  {
    question: "Как происходит буст?",
    answer:
      "После оформления заказа наш бот найдёт свободного бустера. Бустер свяжется с вами в Telegram для получения данных аккаунта (если вы не выбрали Пати с бустерами).",
  },
  {
    question: "Безопасно ли передавать аккаунт?",
    answer:
      "Мы рекомендуем включить опцию 'Оффлайн режим' — бустер будет невидим в Steam и в игре. После завершения смените пароль. Для максимальной безопасности выбирайте 'Пати с бустерами' — передача аккаунта не требуется.",
  },
  {
    question: "Сколько времени занимает буст?",
    answer:
      "Стандартный срок — около 5 дней. С опцией 'Экспресс буст' — 1-2 дня. Время зависит от разницы между текущим и желаемым рейтингом.",
  },
  {
    question: "Что если бустер не выполнил заказ?",
    answer:
      "Обратитесь в поддержку через бота — мы разберёмся в ситуации и при необходимости назначим другого бустера или оформим возврат.",
  },
  {
    question: "Можно ли отменить заказ?",
    answer:
      "Да, пока заказ в статусе 'Ожидание' (ещё не назначен бустер), вы можете отменить его в разделе 'Заказы'.",
  },
]
*/

const FaqAccordion = ({ item }: { item: FaqItem }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className='border border-gray-700 rounded-xl overflow-hidden'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full p-4 flex justify-between items-center text-left hover:bg-white/5 transition-colors'
      >
        <span className='text-white font-gilroyMedium text-[clamp(0.9rem,1.05vw,1.05rem)] pr-4'>
          {item.question}
        </span>
        <span className='text-white/50 text-xl shrink-0 transition-transform duration-200'
          style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          +
        </span>
      </button>
      {isOpen && (
        <div className='px-4 pb-4'>
          <p className='text-white/70 font-gilroy text-[clamp(0.85rem,0.95vw,0.95rem)]'>
            {item.answer}
          </p>
        </div>
      )}
    </div>
  )
}

const Support = () => {
  const botUsername = import.meta.env.VITE_BOT_USERNAME || "SpectreBoostBot"

  return (
    <div className='bg-bgblack w-full max-lgx:min-h-full rounded-[11px] border border-white p-6'>
      <SupportTitle />

      <div className='space-y-6 mt-4'>
        {/* Связаться с поддержкой */}
        <div className='border border-gray-700 rounded-xl p-5 text-center'>
          <h2 className='text-white font-gilroyMedium text-[clamp(1rem,1.2vw,1.2rem)] mb-3'>
            Нужна помощь?
          </h2>
          <p className='text-white/60 font-gilroy text-[clamp(0.85rem,0.95vw,0.95rem)] mb-4'>
            Напишите нашему боту в Telegram — мы ответим в течение нескольких минут.
            Используйте команду /support в боте.
          </p>
          <a
            href={`https://t.me/${botUsername}`}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-block bg-gradient-to-r from-pink-gradient1 to-pink-gradient2 text-white font-gilroyMedium px-8 py-3 rounded-xl text-[clamp(0.95rem,1.1vw,1.1rem)] hover:opacity-90 transition-opacity'
          >
            Написать в поддержку
          </a>
        </div>
      </div>
    </div>
  )
}

export default Support
