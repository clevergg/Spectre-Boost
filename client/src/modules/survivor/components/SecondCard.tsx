import { GoClockFill } from "react-icons/go"
import Survivor from "../../../assets/pubgIcons/prodIcons/Survivor.png"
import { PromoCodeInput } from "./PromoCodeInput"
import { useState } from "react"
import type { PromoValidation } from "../../../core/api/promo.api"
import { ShowPrice } from "./ShowPrice"
import { Title } from "./Title"

export const SecondCard = () => {
  const [promo, setPromo] = useState<PromoValidation | null>(null)
  return (
    <article className='max-lg:w-full bg-transparent pt-12 lg:pt-15 lg:shrink-0 border border-gray lg:flex-2 rounded-xl shadow-md h-full flex flex-col'>
      <Title
        strong='Итого к оплате'
        className='text-[clamp(1.5rem,3vw,2rem)] xl:px-6 text-center text-gradient-purple-blue font-unbounded'
      />
      <div className='bg-[#0A0A0A] flex items-center justify-center w-full my-6 h-fit py-2'>
        <img src={Survivor} alt={"survivor"} loading='lazy' className='h-20' />
      </div>

      <div className='bg-[#0A0A0A] my-5 w-full h-[50px] flex items-center justify-center'>
        <p className='flex flex-row items-center gap-2 text-white font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>
          <GoClockFill className='w-5 h-5' /> Время выполнения: ~30 дней
        </p>
      </div>

      <div className='px-5 my-4 mt-auto space-y-5'>
        <PromoCodeInput onApply={setPromo} />
        <ShowPrice promo={promo} />
      </div>
    </article>
  )
}
