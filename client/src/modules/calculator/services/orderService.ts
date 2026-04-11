import { createOrder } from "../../../core/api/orders.api"
import { createPayment } from "../../../core/api/payments.api"
import type { PromoValidation } from "../../../core/api/promo.api"
import type { additionItem } from "../types"

interface handleOrderProps {
  isAuthenticated: boolean
  setIsProcessing: (isProcessing: boolean) => void
  amount: number
  handleChangeIsModalClick: (isModalClick: boolean) => void
  promo: PromoValidation | null
  items: additionItem[]
  startRating: number
  targetRating: number
}

export const handleOrder = async ({
  isAuthenticated,
  setIsProcessing,
  amount,
  handleChangeIsModalClick,
  promo,
  items,
  targetRating,
  startRating,
}: handleOrderProps): Promise<void> => {
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

    const order = await createOrder({
      serviceId: 1,
      startValue: startRating,
      targetValue: targetRating,
      totalPrice: amount,
      additions: activeAdditions.length > 0 ? activeAdditions : undefined,
      promoCode: promo?.code,
    })

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
