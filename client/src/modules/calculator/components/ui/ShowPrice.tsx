/**
 * ShowPrice — обновлённый компонент с реальным созданием заказа.
 *
 * БЫЛО: кнопка "Оплатить" ничего не делала
 * СТАЛО: кнопка отправляет заказ на бэкенд через API
 *
 * Новые концепции:
 *
 * 1. Сбор данных из нескольких сторов
 *    Калькулятор хранит данные в двух сторах:
 *    - CalculatorSelectedStore (выбранные ранги)
 *    - CalculatorAdditionsStore (допуслуги и итоговая цена)
 *    Мы собираем всё вместе при отправке.
 *
 * 2. Проверка авторизации перед действием
 *    Если юзер не авторизован — показываем модалку входа
 *    вместо отправки заказа.
 *
 * 3. Состояния кнопки: обычная → загрузка → успех → ошибка
 */

import { useState } from "react"
import { useAmount, useItems } from "../../store/CalculatorAdditionsStore"
import {
  useFirstSelectedRank,
  useSecondSelectedRank,
} from "../../store/CalculatorSelectedStore"
import { useIsAuthenticated } from "../../../../core/stores/authStore"
import { handleChangeIsModalClick } from "../../../header/store/HeaderStore"
import { createOrder } from "../../../../core/api/orders.api"
import { GradientButton } from "../../../../shared/ui/GradientButton"

// ID услуги "PUBG Буст ранга" из сида БД.
// В реальном проекте это придёт из каталога,
// но пока у нас одна игра — хардкодим.
const PUBG_BOOST_SERVICE_ID = 1

export const ShowPrice = () => {
  const amount = useAmount()
  const items = useItems()
  const firstRank = useFirstSelectedRank()
  const secondRank = useSecondSelectedRank()
  const isAuthenticated = useIsAuthenticated()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle")

  const handleOrder = async () => {
    // 1. Проверяем авторизацию
    if (!isAuthenticated) {
      handleChangeIsModalClick(true)
      document.body.classList.add("no-scroll")
      return
    }

    // 2. Проверяем что ранги выбраны и цена > 0
    if (!firstRank || !secondRank || amount <= 0) return

    // 3. Собираем данные для заказа
    const activeAdditions = items
      .filter(item => item.isActive && item.koef > 0)
      .map(item => ({
        id: item.id,
        title: item.title,
        koef: item.koef,
      }))

    try {
      setIsSubmitting(true)
      setSubmitStatus("idle")

      await createOrder({
        serviceId: PUBG_BOOST_SERVICE_ID,
        startValue: firstRank.id,
        targetValue: secondRank.id,
        totalPrice: amount,
        additions: activeAdditions.length > 0 ? activeAdditions : undefined,
      })

      setSubmitStatus("success")

      // Через 3 секунды возвращаем кнопку в обычное состояние
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } catch (err) {
      console.error("Order creation failed:", err)
      setSubmitStatus("error")
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Текст кнопки зависит от состояния
  const buttonText =
    submitStatus === "success"
      ? "✅ Заказ создан!"
      : submitStatus === "error"
        ? "Ошибка, попробуйте снова"
        : isSubmitting
          ? "Отправка..."
          : "Оплатить"

  return (
    <footer className='mt-auto'>
      <div className='w-full mb-15 flex max-sm:flex-col gap-5 justify-between sm:h-[55px] max-md:px-10 max-lg:px-20 lg:px-5 xl:px-20'>
        <div className='h-full border-l-3 border-[#FF97EE] flex items-baseline-last'>
          <p className='text-white pl-3 text-[clamp(1.1rem,1.2vw,1.2rem)] font-gilroyMedium pb-1'>
            Итог:{" "}
            <span className='font-gilroy font-semibold text-[clamp(1.3rem,1.45vw,1.45rem)]'>
              {amount} руб
            </span>
          </p>
        </div>

        <GradientButton
          onClick={handleOrder}
          className={`px-15 rounded-[11px] max-sm:py-4 ${
            isSubmitting ? "opacity-70 pointer-events-none" : ""
          }`}
        >
          {buttonText}
        </GradientButton>
      </div>
    </footer>
  )
}
