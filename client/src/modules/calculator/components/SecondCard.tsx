import { useEffect, useState } from "react"
import { GoClockFill } from "react-icons/go"
import { useItems } from "../store/CalculatorAdditionsStore"
import { useStartRating, useTargetRating } from "../store/CalculatorSelectedStore"
import { calculator } from "../services/Calculator"
import { TitleTemplate } from "../../../shared/ui/TitleTemplate"

import { SecondCardAdditionsList } from "./ui/SecondCardAdditionsList"
import { ShowPrice } from "./ui/ShowPrice"
import { PromoCodeInput } from "./PromoCodeInput"
import { type PromoValidation } from "../../../core/api/promo.api"
import { ShowRanksSection } from "./ShowRanksSection"

export const SecondCard = () => {
  const items = useItems()
  const startRating = useStartRating()
  const targetRating = useTargetRating()
  const [promo, setPromo] = useState<PromoValidation | null>(null)

  useEffect(() => {
    calculator.calculatePrice({ startRating, targetRating, items })
  }, [startRating, targetRating, items])

  return (
    <article className='max-lg:w-full bg-transparent border border-gray w-[40%] rounded-xl shadow-md h-full flex flex-col min-h-full'>
      <TitleTemplate
        strong='Итого к оплате'
        className='text-[clamp(1.5rem,3vw,2rem)] xl:px-6 pt-12 lg:pt-20 text-center text-gradient-purple-blue font-unbounded'
      />

      <ShowRanksSection />

      <SecondCardAdditionsList />

      <div className='bg-[#0A0A0A] mb-6 lg:mt-auto py-5 w-full h-[50px] flex items-center justify-center'>
        <p className='flex flex-row items-center gap-2 text-white font-gilroy text-[clamp(1rem,1vw,1rem)]'>
          <GoClockFill className='w-5 h-5' /> Время выполнения: ~5 дней
        </p>
      </div>

      {/* Промокод */}

      <div className='mt-auto px-5'>
        <PromoCodeInput onApply={setPromo} />
        <ShowPrice promo={promo} />
      </div>
    </article>
  )
}
