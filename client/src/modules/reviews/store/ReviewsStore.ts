import type { Review } from "../types"
import { getApprovedReviews, type Review as ApiReview } from "../../../core/api/reviews.api"
import { create } from "zustand"

function mapApiReview(apiReview: ApiReview): Review {
  return {
    id: apiReview.id,
    author: apiReview.author.username || apiReview.author.firstName || "Пользователь",
    img: apiReview.author.photoUrl || null,
    rating: apiReview.rating,
    date: new Date(apiReview.createdAt).toLocaleDateString("ru-RU"),
    text: apiReview.text,
  }
}

interface ReviewsState {
  reviews: Review[]
  isLoading: boolean
  isLoaded: boolean
  fetchReviews: () => Promise<void>
}

const useReviewsStore = create<ReviewsState>((set, get) => ({
  reviews: [],
  isLoading: false,
  isLoaded: false,

  fetchReviews: async () => {
    if (get().isLoaded || get().isLoading) return

    set({ isLoading: true })
    try {
      const data = await getApprovedReviews(30)
      set({ reviews: data.map(mapApiReview), isLoaded: true })
    } catch (err) {
      console.error("Failed to load reviews:", err)
    } finally {
      set({ isLoading: false })
    }
  },
}))

export const useReviews = () => useReviewsStore(s => s.reviews)
export const useReviewsLoading = () => useReviewsStore(s => s.isLoading)
export const fetchReviews = () => useReviewsStore.getState().fetchReviews()
