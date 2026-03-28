import { apiClient } from "./client"

export interface Order {
  id: number
  status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  startValue: number | null
  targetValue: number | null
  totalPrice: number
  additions: Array<{ id: number; title: string; koef: number }> | null
  createdAt: string
  assignedAt: string | null
  completedAt: string | null
  service: {
    id: number
    name: string
    gameCategory: {
      id: number
      name: string
    }
    serviceType: {
      id: number
      name: string
    }
  }
  worker: {
    id: number
    rating: number
    completedCount: number
  } | null
  rating: number | null
  discount: number | null
}

export interface CreateOrderData {
  serviceId: number
  startValue?: number
  targetValue?: number
  totalPrice: number
  additions?: Array<{ id: number; title: string; koef: number }>
  promoCode?: string
  orderType?: "BOOST" | "SURVIVOR_FULL" | "SURVIVOR_PTS"
  targetPts?: number
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
  return apiClient<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function getMyOrders(): Promise<Order[]> {
  return apiClient<Order[]>("/orders")
}

export async function getOrderById(id: number): Promise<Order> {
  return apiClient<Order>(`/orders/${id}`)
}

export async function cancelOrder(id: number): Promise<Order> {
  return apiClient<Order>(`/orders/${id}`, {
    method: "DELETE",
  })
}
