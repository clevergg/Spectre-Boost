import { FirstCard } from "./components/FirstCard"
import { FrameAnimation } from "../../shared/ui/FrameAnimation"
import { SecondCard } from "./components/SecondCard"
import { TitleTemplate } from "../../shared/ui/TitleTemplate"
import { ServicesLinks } from "../../shared/ui/ServicesLinks/ServicesLinks"

const Survivor = () => {
  return (
    <section className='w-full pt-[calc(7rem+7vw)] lg:pt-[calc(5rem+5vw)] pb-[calc(4rem+4vw)] flex flex-col space-y-8 shrink-0 relative'>
      <TitleTemplate
        text='Выживший — Топ 50'
        className='w-full text-[clamp(1.8rem,4.8vw,5rem)]/[115%] md:pb-5'
      />
      <ServicesLinks />
      <FrameAnimation className='w-full max-lg:flex-col flex max-lg:space-y-10 lg:gap-5 xl:gap-10  z-1'>
        <FirstCard />
        <SecondCard />
      </FrameAnimation>
    </section>
  )
}

export default Survivor
