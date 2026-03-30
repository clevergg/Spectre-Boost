import { FirstCard } from "./components/FirstCard"
import { FrameAnimation } from "../../shared/ui/FrameAnimation"
import { SecondCard } from "./components/SecondCard"
import { ServicesLinks } from "../../shared/ui/ServicesLinks/ServicesLinks"
import { TitleTemplate } from "../../shared/ui/TitleTemplate"

const Calculator = () => {
  const BrokenComponent = () => {
    throw new Error("Тестовая ошибка для проверки ErrorBoundary")
    return null
  }
  return (
    <section className='w-full pt-[calc(7rem+7vw)] xl:pt-[calc(5.5rem+5.5vw)] pb-[calc(4rem+4vw)] flex flex-col space-y-8 relative'>
      <TitleTemplate
        text='ПРОКАЧАЙТЕ СВОЙ АККАУНТ В PUBG'
        className='text-[clamp(1.8rem,4.8vw,5rem)]/[115%] font-black font-unbounded md:pb-7 text-white text-balance text-center'
      />
      <BrokenComponent />
      <ServicesLinks />
      <FrameAnimation className='flex max-lg:flex-col max-lg:space-y-10 lg:space-x-5 xl:space-x-10 lg:h-[680px] justify-between z-1'>
        <FirstCard />

        <SecondCard />
      </FrameAnimation>
    </section>
  )
}

export default Calculator
