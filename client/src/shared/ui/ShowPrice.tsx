import type { PromoValidation } from '../../core/api/promo.api'

export interface additionItem {
  id: number
  title: string
  description: string
  value: string
  isActive: boolean
  koef: number
}

interface ShowPriceProps {
  promo: PromoValidation | null
  amount: number
  isAuthenticated: boolean
  isProcessing: boolean
  onOrder: (items?: additionItem[]) => void
}

export const ShowPrice = ({
  promo,
  amount,
  isAuthenticated,
  isProcessing,
  onOrder,
}: ShowPriceProps) => {
  const discountedAmount = promo ? Math.round(amount * (1 - promo.discount / 100)) : amount

  return (
    <div className='flex flex-col pt-5 items-center pb-10 gap-3'>
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
        onClick={() => onOrder()}
        disabled={amount <= 0 || isProcessing}
        className={`w-full py-3 rounded-xl font-gilroy text-[clamp(1rem,1.2vw,1.2rem)] font-semibold transition-all ${
          amount > 0 && !isProcessing
            ? "bg-linear-to-r from-pink-gradient1 to-pink-gradient2 text-white cursor-pointer hover:opacity-90"
            : "bg-gray-800 text-gray-500 cursor-not-allowed"
        }`}
      >
        {!isAuthenticated ? "Войдите чтобы заказать" : isProcessing ? "Обработка..." : "Оплатить"}
      </button>
    </div>
  )
}
