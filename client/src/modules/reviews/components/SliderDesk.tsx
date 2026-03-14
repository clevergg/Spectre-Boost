import { useEffect, useState } from "react"
import { type Review } from "../types"
import { SliderDeskCard } from "./SliderDeskCard"
import MarqueeItem from "./MarqueeItem"

interface ReviewsSliderDescInterface {
  reviews: Review[]
  id: string
  direction: "left" | "right"
}

export const SliderDesk = ({ reviews, id, direction }: ReviewsSliderDescInterface) => {
  const reviewsData = [...reviews]
  const [isMounted, setIsMounted] = useState<boolean>(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted)
    return reviewsData.map(review => <SliderDeskCard key={review.id} review={review} />)

  return (
    <MarqueeItem
      key={id}
      review={reviewsData}
      from={direction === "left" ? 0 : "-100%"}
      to={direction === "left" ? "-100%" : 0}
    />
  )
}
