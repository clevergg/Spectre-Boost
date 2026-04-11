import { createPayment } from "../../../core/api/payments.api"
import { createOrder } from "../../../core/api/orders.api"
import type { PromoValidation } from '../../../core/api/promo.api'

interface handleOrderProps {
  isAuthenticated: boolean
  setIsProcessing: (isProcessing: boolean) => void
  boostVariant: "survivor_pts" | "survivor_full"
  amount: number,
	handleChangeIsModalClick: (isModalClick: boolean) => void,
	promo: PromoValidation | null
}

export const handleOrder = async ({
  isAuthenticated,
  setIsProcessing,
  boostVariant,
  amount,
	handleChangeIsModalClick,
	promo
}: handleOrderProps): Promise<void> => {
  if (!isAuthenticated) {
    handleChangeIsModalClick(true)
    return
  }

  setIsProcessing(true)

  try {
    // Определяем orderType и serviceId по варианту буста
    const orderType = boostVariant === "survivor_full" ? "SURVIVOR_FULL" : "SURVIVOR_PTS"

    const order = await createOrder({
      serviceId: boostVariant === "survivor_full" ? 4 : 5, // ID из seed
      totalPrice: amount,
      promoCode: promo?.code,
      orderType,
    })

    try {
      const payment = await createPayment(order.id)
      if (payment.paymentUrl) {
        window.location.href = payment.paymentUrl
        return
      }
    } catch {
      // YooKassa не настроена
    }

    alert("Заказ создан! Проверьте Telegram.")
  } catch (err: any) {
    console.error("Order failed:", err)
    alert(err.message || "Ошибка")
  } finally {
    setIsProcessing(false)
  }
}
