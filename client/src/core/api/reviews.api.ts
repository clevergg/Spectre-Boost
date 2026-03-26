/**
 * Reviews API — отзывы.
 */

import { apiClient } from "./client"

// ─── Типы ───

export interface Review {
  id: number
  rating: number
  text: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  author: {
    id: number
    username: string | null
    firstName: string | null
    photoUrl: string | null
  }
  order: {
    id: number
    service: {
      name: string
      gameCategory: {
        name: string
      }
    }
  }
}

export interface CreateReviewData {
  orderId: number
  rating: number
  text: string
}

// ─── API функции ───

/**
 * Получить одобренные отзывы (публичный, без авторизации).
 * Заменяет хардкод ReviewsData.ts.
 */
export async function getApprovedReviews(limit: number = 20): Promise<Review[]> {
  return apiClient<Review[]>(`/reviews?limit=${limit}`)
}

/**
 * Создать отзыв (CUSTOMER, после завершения заказа).
 */
export async function createReview(data: CreateReviewData): Promise<Review> {
  return apiClient<Review>("/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
