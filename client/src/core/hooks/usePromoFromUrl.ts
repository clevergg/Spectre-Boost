/**
 * usePromoFromUrl — хук для перехвата промокода из URL.
 *
 * Вызывается один раз в App или MainRouter.
 * Если в URL есть ?promo=CODE — сохраняет в localStorage.
 * PromoCodeInput потом подхватит из storage.
 *
 * Работает на ЛЮБОЙ странице:
 * - spectre.com/?promo=BLOGER10           → главная
 * - spectre.com/services?promo=BLOGER10   → услуги
 * - spectre.com/aboutus?promo=BLOGER10    → о нас
 */

import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"

const PROMO_STORAGE_KEY = "spectre_promo_code"

export function usePromoFromUrl() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const promoFromUrl = searchParams.get("promo")
    if (promoFromUrl) {
      localStorage.setItem(PROMO_STORAGE_KEY, promoFromUrl.toUpperCase())
    }
  }, [searchParams])
}
