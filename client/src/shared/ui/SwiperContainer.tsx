// SwiperContainer.tsx
import { type ReactNode, Children } from "react"
import { Scrollbar, Mousewheel, FreeMode } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

interface SwiperContainerProps {
  children: ReactNode
  className?: string
}

export const SwiperContainer = ({ children, className = "" }: SwiperContainerProps) => {
  return (
    <Swiper
      modules={[Scrollbar, Mousewheel, FreeMode]}
      className={className}
      slidesPerView={1}
      spaceBetween={16}
      centeredSlides={false}
      freeMode={{
        enabled: true,
        momentum: true,
        momentumRatio: 0.75,
        momentumBounce: false,
        momentumVelocityRatio: 0.5,
      }}
      resistance={true}
      resistanceRatio={0.85}
      touchRatio={1}
      speed={400}
      direction='horizontal'
      watchSlidesProgress={true}
    >
      {Children.map(children, (child, index) => (
        <SwiperSlide key={index}>{child}</SwiperSlide>
      ))}
    </Swiper>
  )
}
