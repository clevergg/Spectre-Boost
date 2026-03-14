import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import { routes } from "../../app/config/routes"
import { ScrollAnimation } from "../../shared/ui/ScrollAnimation"
import {
  ReviewsAboutUsTitle,
  ReviewsHomeTitle,
  ReviewsServicesTitle,
} from "./components/ReviewsTitles"
import { SliderDesk } from "./components/SliderDesk"
import { SliderMobile } from "./components/SliderMobile"
import { ReviewsData as reviews } from "./data/ReviewsData"
import { type Review } from "./types"
import { useIsMobile } from "../../core/hooks/useIsMobile"

interface ReviewsDataInterface {
  slider: number
  direction: "left" | "right"
  id: string
  reviews: Review[]
}

const Reviews = () => {
  const isMobile = useIsMobile()
  const { pathname } = useLocation()

  const mobileReviews = useMemo<ReviewsDataInterface[]>(
    () => reviews.filter(rev => rev.id === "slider1"),
    [reviews]
  )

  const renderTitle = () => {
    switch (pathname) {
      case routes.home:
        return <ReviewsHomeTitle />
      case routes.services:
        return <ReviewsServicesTitle />
      default:
        return <ReviewsAboutUsTitle />
    }
  }

  return (
    <section className='mb-20'>
      <ScrollAnimation duration={0.4} animation='slideUp' className='items-center flex flex-col'>
        {renderTitle()}
        <div
          className={`relative flex flex-col ${
            isMobile ? "px-5" : null
          } space-y-5 w-screen min-w-[360px] max-w-[2560px]`}
        >
          {!isMobile
            ? reviews.map((slider: ReviewsDataInterface, index: number) => {
                return (
                  <SliderDesk
                    key={index}
                    reviews={slider.reviews}
                    id={slider.id}
                    direction={slider.direction}
                  />
                )
              })
            : mobileReviews.map((slider, index) => (
                <SliderMobile key={index} reviews={slider.reviews} id={slider.id} />
              ))}
        </div>
      </ScrollAnimation>
    </section>
  )
}

export default Reviews
