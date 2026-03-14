import { lazy } from "react"
import { AboutUsHero, AboutUsRecords } from "../modules/aboutus"
import { BgShining } from "../shared/ui/BackgroundShining"
import { Questions } from "../shared/ui/Questions"
import { aboutUsRouteClass, baseLayoutClass } from "./constants"

const Features = lazy(() => import("../shared/ui/Features"))
const Reviews = lazy(() => import("../modules/reviews"))

const AboutUsRoute = () => {
  return (
    <>
      <div className={aboutUsRouteClass}>
        <AboutUsHero />
        <AboutUsRecords />
      </div>
      <Reviews />
      <div className={baseLayoutClass}>
        <Features />
        <BgShining
          top='top-100 max-md:top-240 '
          left='left-0 max-md:left-[-100px]'
          bgColor='bg-[#140819]'
          blur='blur-[120px]'
          className='w-[50%] h-220 max-xl:w-154 max-md:w-104 max-md:h-104 max-xl:h-154'
          animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
          brightness='brightness-100'
        />
        <BgShining
          top='top-170 max-md:top-270'
          right='right-40 max-xl:right-[-70px]'
          bgColor='bg-[#090717] '
          blur='blur-[120px]'
          className='w-[50%] h-200 max-xl:w-154 max-md:w-104 max-md:h-104 max-xl:h-154'
          animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
        />
        <Questions />
      </div>
    </>
  )
}

export default AboutUsRoute
