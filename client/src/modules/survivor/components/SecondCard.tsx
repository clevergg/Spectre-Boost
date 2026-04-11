import { GoClockFill } from "react-icons/go"
import Survivor from "../../../assets/pubgIcons/prodIcons/Survivor.png"
import { useCallback, useState } from "react"
import type { PromoValidation } from "../../../core/api/promo.api"
import { TitleTemplate } from "../../../shared/ui/TitleTemplate"
import { PromoCodeInput } from "../../../components/PromoCodeInput"
import { useAmount, useBoostVariant } from "../store/SurvivorStore"
import { useIsAuthenticated } from "../../../core/stores/authStore"
import { ShowPrice } from "../../../shared/ui/ShowPrice"
import { handleOrder } from "../services/orderService"
import { handleChangeIsModalClick } from "../../header/store/HeaderStore"

export const SecondCard = () => {
  const [promo, setPromo] = useState<PromoValidation | null>(null)
  const amount = useAmount()
  const boostVariant = useBoostVariant()
  const isAuthenticated = useIsAuthenticated()
  const [isProcessing, setIsProcessing] = useState(false)

  const onOrder = useCallback(() => {
    handleOrder({
      isAuthenticated,
      setIsProcessing,
      boostVariant,
      amount,
      promo,
      handleChangeIsModalClick,
    })
  }, [isAuthenticated, promo, boostVariant, amount])
  return (
    <article className='max-lg:w-full bg-transparent pt-12 lg:pt-15 lg:shrink-0 border border-gray lg:flex-2 rounded-xl min-h-full flex flex-col'>
      <TitleTemplate
        strong='Итого к оплате'
        className='text-[clamp(1.5rem,3vw,2rem)] xl:px-6 text-gradient-purple-blue'
      />
      <div className='bg-[#0A0A0A] flex items-center justify-center w-full my-6 h-fit py-2'>
        <img src={Survivor} alt={"Survivor"} loading='lazy' className='h-20' />
      </div>

      <div className='bg-[#0A0A0A] mt-auto mb-5 w-full py-5 flex items-center justify-center'>
        <p className='flex flex-row items-center gap-2 text-white font-gilroy text-[clamp(1.05rem,1.1vw,1.1rem)]'>
          <GoClockFill className='w-5 h-5' /> Время выполнения: ~30 дней
        </p>
      </div>

      <div className='px-5 max-lg:my-4 lg:mt-auto space-y-5'>
        <PromoCodeInput onApply={setPromo} />
        <ShowPrice
          promo={promo}
          amount={amount}
          isAuthenticated={isAuthenticated}
          isProcessing={isProcessing}
          onOrder={onOrder}
        />
      </div>
    </article>
  )
}
