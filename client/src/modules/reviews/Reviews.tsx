import { useEffect, useMemo, useState } from "react"
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
import { type Review } from "./types"
import { useIsMobile } from "../../core/stores/windowStore"
import { fetchReviews, useReviews, useReviewsLoading } from "./store/ReviewsStore"

interface ReviewsSliderData {
  slider: number
  direction: "left" | "right"
  id: string
  reviews: Review[]
}

const Reviews = () => {
  const isMobile = useIsMobile()
  const { pathname } = useLocation()
  const apiReviews = useReviews()
  const isLoading = useReviewsLoading()

  useEffect(() => {
    fetchReviews()
  }, [])

  const sliders = useMemo<ReviewsSliderData[]>(() => {
    if (apiReviews.length === 0) return []

    const mid = Math.ceil(apiReviews.length / 2)

    return [
      {
        slider: 1,
        direction: "right" as const,
        id: "slider1",
        reviews: apiReviews.slice(0, mid),
      },
      {
        slider: 2,
        direction: "left" as const,
        id: "slider2",
        reviews: apiReviews.slice(mid),
      },
    ].filter(s => s.reviews.length > 0)
  }, [apiReviews])

  const mobileReviews = useMemo<ReviewsSliderData[]>(
    () => sliders.filter(rev => rev.id === "slider1"),
    [sliders]
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

  if (isLoading) return null
  if (apiReviews.length === 0) return null

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
            ? sliders.map((slider: ReviewsSliderData, index: number) => (
                <SliderDesk
                  key={index}
                  reviews={slider.reviews}
                  id={slider.id}
                  direction={slider.direction}
                />
              ))
            : mobileReviews.map((slider, index) => (
                <SliderMobile key={index} reviews={slider.reviews} id={slider.id} />
              ))}
        </div>
      </ScrollAnimation>
    </section>
  )
}

export default Reviews
