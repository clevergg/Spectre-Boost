import { useState } from "react"
import { useAmount, useItems } from "../../store/CalculatorAdditionsStore"
import {
  useStartRating,
  useTargetRating,
} from "../../store/CalculatorSelectedStore"
import { useIsAuthenticated } from "../../../../core/stores/authStore"
import { createOrder } from "../../../../core/api/orders.api"
import { createPayment } from "../../../../core/api/payments.api"
import { handleChangeIsModalClick } from "../../../header/store/HeaderStore"
import { type PromoValidation } from "../../../../core/api/promo.api"

interface ShowPriceProps {
  promo?: PromoValidation | null
}

export const ShowPrice = ({ promo }: ShowPriceProps) => {
  const amount = useAmount()
  const items = useItems()
  const startRating = useStartRating()
  const targetRating = useTargetRating()
  const isAuthenticated = useIsAuthenticated()
  const [isProcessing, setIsProcessing] = useState(false)

  const discountedAmount = promo
    ? Math.round(amount * (1 - promo.discount / 100))
    : amount

  const handleOrder = async () => {
    if (!isAuthenticated) {
      handleChangeIsModalClick(true)
      return
    }

    if (amount <= 0 || startRating >= targetRating) return

    setIsProcessing(true)

    try {
      const activeAdditions = items
        .filter(item => item.isActive && item.koef > 0)
        .map(item => ({ id: item.id, title: item.title, koef: item.koef }))

      // 1. Создаём заказ
      const order = await createOrder({
        serviceId: 1,
        startValue: startRating,
        targetValue: targetRating,
        totalPrice: amount,
        additions: activeAdditions.length > 0 ? activeAdditions : undefined,
        promoCode: promo?.code,
      })

      // 2. Создаём платёж и редиректим на YooKassa
      const payment = await createPayment(order.id)

      if (payment.paymentUrl) {
        window.location.href = payment.paymentUrl
      } else {
        alert("Ошибка создания платежа")
      }
    } catch (err: any) {
      console.error("Order/payment failed:", err)
      alert(err.message || "Ошибка")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='flex flex-col items-center px-5 pb-6 gap-3'>
      <div className='text-center'>
        {promo && amount > 0 ? (
          <>
            <p className='text-white/40 font-gilroy text-[clamp(0.85rem,1vw,1rem)] line-through leading-tight'>
              {amount.toLocaleString("ru-RU")} ₽
            </p>
            <p className='text-white font-unbounded text-[clamp(1.3rem,1.8vw,1.8rem)] leading-tight'>
              {discountedAmount.toLocaleString("ru-RU")} ₽
            </p>
            <p className='text-green-400 font-gilroy text-[clamp(0.75rem,0.85vw,0.85rem)] mt-1'>
              Скидка {promo.discount}%
            </p>
          </>
        ) : (
          <p className='text-white font-unbounded text-[clamp(1.3rem,1.8vw,1.8rem)]'>
            {amount > 0 ? `${amount.toLocaleString("ru-RU")} ₽` : "—"}
          </p>
        )}
      </div>

      <button
        onClick={handleOrder}
        disabled={amount <= 0 || isProcessing}
        className={`w-full py-3 rounded-xl font-gilroy text-[clamp(1rem,1.2vw,1.2rem)] font-semibold transition-all ${
          amount > 0 && !isProcessing
            ? "bg-gradient-to-r from-pink-gradient1 to-pink-gradient2 text-white cursor-pointer hover:opacity-90"
            : "bg-gray-800 text-gray-500 cursor-not-allowed"
        }`}
      >
        {!isAuthenticated
          ? "Войдите чтобы заказать"
          : isProcessing
            ? "Обработка..."
            : "Оплатить"}
      </button>
    </div>
  )
}
