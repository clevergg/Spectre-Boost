import { apiClient } from "./client"

export interface PromoValidation {
  code: string
  discount: number
  influencer: string
}

/**
 * Проверить промокод — возвращает скидку или ошибку
 */
export async function validatePromo(code: string): Promise<PromoValidation> {
  return apiClient<PromoValidation>("/promo/validate", {
    method: "POST",
    body: JSON.stringify({ code }),
  })
}
