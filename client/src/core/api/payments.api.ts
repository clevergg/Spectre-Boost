import { apiClient } from "./client"

export interface PaymentResponse {
  paymentUrl: string
  paymentId: string
}

/**
 * Создать платёж для заказа.
 * Возвращает URL для редиректа на страницу оплаты YooKassa.
 */
export async function createPayment(
  orderId: number,
  paymentMethod?: "sbp" | "bank_card",
): Promise<PaymentResponse> {
  return apiClient<PaymentResponse>("/payments/create", {
    method: "POST",
    body: JSON.stringify({ orderId, paymentMethod }),
  })
}
