/**
 * Reviews — обновлённый компонент.
 *
 * БЫЛО: import { ReviewsData } from "./data/ReviewsData" — хардкод
 * СТАЛО: getApprovedReviews() из API — реальные отзывы из БД
 *
 * Как работает:
 * 1. useEffect загружает одобренные отзывы из API
 * 2. mapApiReviews преобразует формат API → формат слайдера
 * 3. Отзывы разбиваются на два слайдера (чётные/нечётные)
 * 4. Если отзывов нет — показываем заглушку
 *
 * Компоненты SliderDesk, SliderMobile, SliderDeskCard
 * НЕ менялись — они работают с типом Review из types.ts
 */

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
import { useIsMobile } from "../../core/hooks/useIsMobile"
import {
  getApprovedReviews,
  type Review as ApiReview,
} from "../../core/api/reviews.api"

interface ReviewsSliderData {
  slider: number
  direction: "left" | "right"
  id: string
  reviews: Review[]
}

/**
 * Маппинг из API-формата в формат для слайдера.
 * API: { author: { username, firstName, photoUrl }, createdAt, ... }
 * Слайдер: { author: string, img: string, date: string, ... }
 */
function mapApiReview(apiReview: ApiReview): Review {
  return {
    id: apiReview.id,
    author:
      apiReview.author.username ||
      apiReview.author.firstName ||
      "Пользователь",
    img: apiReview.author.photoUrl || null,
    rating: apiReview.rating,
    date: new Date(apiReview.createdAt).toLocaleDateString("ru-RU"),
    text: apiReview.text,
  }
}

const Reviews = () => {
  const isMobile = useIsMobile()
  const { pathname } = useLocation()
  const [apiReviews, setApiReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Загружаем отзывы из API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getApprovedReviews(30)
        setApiReviews(data.map(mapApiReview))
      } catch (err) {
        console.error("Failed to load reviews:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  // Разбиваем на два слайдера для десктопа
  const sliders = useMemo<ReviewsSliderData[]>(() => {
    if (apiReviews.length === 0) return []

    // Первая половина — слайдер вправо, вторая — влево
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
    ].filter((s) => s.reviews.length > 0)
  }, [apiReviews])

  const mobileReviews = useMemo<ReviewsSliderData[]>(
    () => sliders.filter((rev) => rev.id === "slider1"),
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

  // Пока загружается или нет отзывов — не показываем секцию
  if (isLoading) return null
  if (apiReviews.length === 0) return null

  return (
    <section className='mb-20'>
      <ScrollAnimation
        duration={0.4}
        animation='slideUp'
        className='items-center flex flex-col'
      >
        {renderTitle()}
        <div
          className={`relative flex flex-col ${
            isMobile ? "px-5" : null
          } space-y-5 w-screen min-w-[360px] max-w-[2560px]`}
        >
          {!isMobile
            ? sliders.map(
                (slider: ReviewsSliderData, index: number) => (
                  <SliderDesk
                    key={index}
                    reviews={slider.reviews}
                    id={slider.id}
                    direction={slider.direction}
                  />
                )
              )
            : mobileReviews.map((slider, index) => (
                <SliderMobile
                  key={index}
                  reviews={slider.reviews}
                  id={slider.id}
                />
              ))}
        </div>
      </ScrollAnimation>
    </section>
  )
}

export default Reviews
