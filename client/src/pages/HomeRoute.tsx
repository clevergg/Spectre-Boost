import { lazy } from "react"
import { CardsSection, HeroSection } from "../modules/home"
import { BgShining } from "../shared/ui/BackgroundShining"
import { Questions } from "../shared/ui/Questions"
import { baseLayoutClass, HomeQuestionsLayoutClass } from "./constants"
import { SEO } from "../core/components/SEO"
import { SEO_CONFIG } from "../core/config/seo.config"

const Reviews = lazy(() => import("../modules/reviews"))

const HomeRoute = () => {
  return (
    <>
      <SEO {...SEO_CONFIG.home} />
      <div className={baseLayoutClass}>
        <BgShining
          top='top-0'
          left='left-0'
          bgColor='bg-[#2f1b2c]'
          blur='blur-[90px]'
          animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
          className='w-150 h-130 max-lg:w-110 max-lg:h-90 max-md:w-full max-md:h-[25%]'
        />
        <HeroSection />
        <CardsSection />
        <BgShining
          top='max-lg:top-[100%] top-280'
          left='left-[-150px]'
          bgColor='bg-[#060a16]'
          blur='blur-[90px]'
          animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
          className='max-md:w-full max-lg:h-[20%] w-145 h-131'
        />

        <BgShining
          top='max-lg:top-[105%] top-290'
          left='max-sm:left-[20%] left-80'
          bgColor='bg-[#13061d]'
          blur='blur-[90px]'
          animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
          className='max-md:w-full max-lg:h-[20%] w-145 h-131'
        />

        <BgShining
          top='max-lg:top-[110%] top-300'
          left='max-sm:left-[25%] left-200'
          bgColor='bg-[#060a16]'
          blur='blur-[100px]'
          animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
          className='max-md:w-full max-lg:h-[20%] w-145 h-131'
        />
      </div>

      <Reviews />
      <div className={HomeQuestionsLayoutClass}>
        <Questions />

        <BgShining
          top='top-50 max-sm:top-[110%] max-lg:top-[100%]'
          left='left-[-270px] max-sm:left-[-50%]'
          bgColor='bg-[#0e1f19]'
          blur='blur-[90px]'
          animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
          className='max-md:w-full max-lg:h-[50%] w-145 h-131'
        />
      </div>
    </>
  )
}

export default HomeRoute
