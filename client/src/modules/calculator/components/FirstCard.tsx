import { lazy } from "react"
import { FirstCardAdditions } from "./FirstCardAdditions"
import { FirstCardInputs } from "./ui/FirstCardInputs"
import { TitleTemplate } from "../../../shared/ui/TitleTemplate"

const TextType = lazy(() => import("../../../shared/ui/TextType"))

export const FirstCard = () => {
  return (
    <article className='bg-transparent border flex flex-col justify-between border-gray lg:w-[60%] rounded-xl shadow-md pt-12 lg:pt-20 gap-6 '>
      <div className='flex flex-col justify-center items-center space-y-6'>
        <TitleTemplate
          text='Рассчитайте стоимость'
          strong='буста'
          className='text-[clamp(1.55rem,2.7vw,2rem)] text-center text-gradient-purple-blue max-lg:px-[calc(1rem+2vw)] [&_strong]:text-white font-unbounded'
        />
        <TextType
          text={["Прокачай свой ранг", "Повысь уровень"]}
          typingSpeed={60}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter='|'
          className='text-white font-unbounded text-center text-[clamp(1.5rem,2.5vw,3rem)]'
        />
        <hr className='h-0.5 bg-gray w-[250px]' />
      </div>
      <div className='flex flex-col space-y-5 px-[calc(1rem+1vw)]'>
        <div className='flex flex-col space-y-5'>
          <FirstCardInputs />
          <FirstCardAdditions />
        </div>
      </div>
    </article>
  )
}
