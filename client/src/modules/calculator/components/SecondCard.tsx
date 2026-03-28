import { useEffect, useState } from "react"
import { GoClockFill } from "react-icons/go"
import { LiaArrowRightSolid } from "react-icons/lia"
import { useItems } from "../store/CalculatorAdditionsStore"
import {
  useStartRating,
  useTargetRating,
  useStartRank,
  useTargetRank,
} from "../store/CalculatorSelectedStore"
import { calculator } from "../services/Calculator"
import { SecondCardTitle } from "./ui/Titles"
import { SecondCardAdditionsList } from "./ui/SecondCardAdditionsList"
import { ShowPrice } from "./ui/ShowPrice"
import { PromoCodeInput } from "./PromoCodeInput"
import { type PromoValidation } from "../../../core/api/promo.api"

export const SecondCard = () => {
  const items = useItems()
  const startRating = useStartRating()
  const targetRating = useTargetRating()
  const startRank = useStartRank()
  const targetRank = useTargetRank()
  const [promo, setPromo] = useState<PromoValidation | null>(null)

  useEffect(() => {
    calculator.calculatePrice({ startRating, targetRating, items })
  }, [startRating, targetRating, items])

  return (
    <article className='max-lg:w-full bg-transparent border border-gray w-[40%] rounded-xl shadow-md h-full flex flex-col'>
      <SecondCardTitle />

      <div className='bg-[#0A0A0A] w-full my-6 h-[65px]'>
        {startRank && targetRank && startRating < targetRating && (
          <div className='flex flex-row items-center px-5 justify-center h-full gap-3'>
            <div className='flex items-center gap-2'>
              <img src={startRank.image} alt={startRank.name} className='h-[40px]' />
              <div className='text-white font-gilroy'>
                <p className='text-[clamp(0.85rem,1vw,1rem)] font-semibold'>{startRank.name}</p>
                <p className='text-gray text-[clamp(0.75rem,0.85vw,0.85rem)]'>{startRating}</p>
              </div>
            </div>

            <LiaArrowRightSolid className='w-8 h-8 text-white' />

            <div className='flex items-center gap-2'>
              <img src={targetRank.image} alt={targetRank.name} className='h-[40px]' />
              <div className='text-white font-gilroy'>
                <p className='text-[clamp(0.85rem,1vw,1rem)] font-semibold'>{targetRank.name}</p>
                <p className='text-gray text-[clamp(0.75rem,0.85vw,0.85rem)]'>{targetRating}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <SecondCardAdditionsList />

      {/* Промокод */}
      <div className='px-5 my-4'>
        <PromoCodeInput onApply={setPromo} />
      </div>

      <div className='bg-[#0A0A0A] my-5 w-full h-[50px] flex items-center justify-center'>
        <p className='flex flex-row items-center gap-2 text-white font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>
          <GoClockFill className='w-5 h-5' /> Время выполнения: ~5 дней
        </p>
      </div>

      <ShowPrice promo={promo} />
    </article>
  )
}
