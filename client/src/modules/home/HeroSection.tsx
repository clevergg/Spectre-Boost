import { FaCircleArrowRight } from "react-icons/fa6"
import { GradientButton } from "../../shared/ui/GradientButton"
import { HomeTitle } from "./components/HeroTitle"
export const HeroSection = () => {
  return (
    <section className='w-full pt-[calc(9rem+9vw)] xl:pt-[calc(7rem+7vw)] pb-[calc(3rem+3vw)]'>
      <div className='relative flex flex-col space-y-9 justify-center items-center text-center'>
        <HomeTitle />

        <GradientButton type='singleNavigate' className='px-5 py-2.5'>
          <span className='flex flex-row items-center text-center gap-5 text-[clamp(1rem,1.4vw,1.5rem)]'>
            Заказать буст <FaCircleArrowRight className='w-[30px] h-[30px]' />
          </span>
        </GradientButton>
      </div>
    </section>
  )
}
