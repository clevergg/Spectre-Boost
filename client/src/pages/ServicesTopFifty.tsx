import { lazy } from "react"
import { BgShining } from "../shared/ui/BackgroundShining"
import { Questions } from "../shared/ui/Questions"
import { ServicesRouteClass } from "./constants"
import { SEO } from "../core/components/SEO"
import { SEO_CONFIG } from "../core/config/seo.config"

const Features = lazy(() => import("../shared/ui/Features"))
const Topfifty = lazy(() => import("../modules/topfifty"))
const Reviews = lazy(() => import("../modules/reviews"))

const ServicesRoute = () => {
  return (
    <>
      <SEO {...SEO_CONFIG.services} />
      <div className={`${ServicesRouteClass} w-full`}>
        <BgShining
          top='top-30 max-sm:top-10'
          left='left-30 max-lg:left-0 max-sm:left-[-50px]'
          bgColor='bg-[#090717]'
          blur='blur-[80px]'
          animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
          className='w-100 h-100 '
          brightness='brightness-150'
        />
        <BgShining
          top='top-70 max-sm:top-40'
          left='left-120 max-lg:left-60 max-sm:left-30'
          bgColor='bg-[#140819]'
          blur='blur-[80px]'
          animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
          className='w-85 h-85'
          brightness='brightness-150'
        />
        <Topfifty />
      </div>
      <Reviews />
      <div className={ServicesRouteClass}>
        <BgShining
          top='top-40 max-md:top-0 max-lg:top-10'
          right='right-0 max-md:right-10'
          bgColor='bg-[#140819]'
          blur='blur-[80px]'
          animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
          className='w-84 h-84 max-sm:h-[15%] max-md:w-[50%] max-md:h-[25%]'
        />
        <BgShining
          top='top-[-50px] max-md:top-[-150px] max-sm:top-[-50px]'
          right='right-80 max-sm:right-60'
          bgColor='bg-[#090717]'
          blur='blur-[80px]'
          animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
          className='w-115 h-115 max-sm:h-[15%] max-md:w-[50%] max-md:h-[25%]'
        />
        <Features />

        <BgShining
          top='top-150 max-md:top-240'
          left='left-0 max-sm:left-[-50px]'
          bgColor='bg-[#090717]'
          blur='blur-[80px]'
          animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
          className='w-90 h-90 '
        />
        <BgShining
          top='top-180 max-md:top-270'
          left='left-90 max-sm:left-40'
          bgColor='bg-[#140819]'
          blur='blur-[80px]'
          animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
          className='w-70 h-70'
        />
        <Questions />
        <BgShining
          bottom='bottom-[-300px]'
          right='right-35 max-xl:right-0'
          bgColor='bg-[#0b0b0b]'
          blur='blur-[80px]'
          animation='animate-[moveInCircle_30s_ease-in-out_infinite]'
          className='w-70 h-70 max-md:w-[50%] max-md:h-[15%]'
        />
      </div>
    </>
  )
}

export default ServicesRoute
