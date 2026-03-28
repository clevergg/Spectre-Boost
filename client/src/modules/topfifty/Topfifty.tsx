import { FirstCard } from "./components/FirstCard"
import { FrameAnimation } from "../../shared/ui/FrameAnimation"
import { SecondCard } from "./components/SecondCard"
import { Title } from "./components/Title"
import { ServicesLinks } from "../../shared/ui/ServicesLinks/ServicesLinks"

const Topfifty = () => {
  return (
    <section className='w-full pt-[calc(5rem+5vw)] pb-[calc(4rem+4vw)] flex flex-col space-y-8 shrink-0 relative'>
      <Title
        text='Буст топ 50 ранга'
        className='w-full text-[clamp(1.8rem,4.8vw,5rem)]/[115%] z-1 font-black font-unbounded md:pb-5 text-white text-balance text-center'
      />
      <ServicesLinks />
      <FrameAnimation className='w-full max-lg:flex-col flex max-lg:space-y-10 lg:gap-5 xl:gap-10 lg:h-[650px] z-1'>
        <FirstCard />

        <SecondCard />
      </FrameAnimation>
    </section>
  )
}

export default Topfifty
