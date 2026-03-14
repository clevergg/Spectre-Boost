import { FirstCard } from "./components/FirstCard"
import { FrameAnimation } from "../../shared/ui/FrameAnimation"
import { Title } from "./components/ui/Titles"
import { SecondCard } from "./components/SecondCard"

const Calculator = () => {
  return (
    <section className='w-full pt-[calc(7rem+7vw)] xl:pt-[calc(5.5rem+5.5vw)] pb-[calc(4rem+4vw)] flex flex-col space-y-8 relative'>
      <Title />
      <FrameAnimation className='flex max-lg:flex-col max-lg:space-y-10 lg:space-x-5 xl:space-x-10 lg:h-[680px] justify-between z-1'>
        <FirstCard />

        <SecondCard />
      </FrameAnimation>
    </section>
  )
}

export default Calculator
