import { lazy } from "react"
import { FirstCardAdditions } from "./FirstCardAdditions"
import { FirstCardSelects } from "./ui/FirstCardSelects"
import { FirstCardTitle } from "./ui/Titles"

const TextType = lazy(() => import("../../../shared/ui/TextType"))

export const FirstCard = () => {
  return (
    <article className='bg-transparent border flex flex-col justify-between border-gray lg:w-[60%] rounded-xl shadow-md py-12 lg:py-20 h-full  gap-8'>
      <div className='flex flex-col justify-center items-center space-y-8'>
        <FirstCardTitle />
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
          <FirstCardSelects />
          <FirstCardAdditions />
        </div>
      </div>
    </article>
  )
}
