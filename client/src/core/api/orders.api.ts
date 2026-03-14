/**
 * Orders API — CRUD заказов.
 */

import { apiClient } from "./client"

// ─── Типы ───

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
    username: string | null
    firstName: string | null
    rating: number
    completedCount: number
  } | null
}

export interface CreateOrderData {
  serviceId: number
  startValue?: number
  targetValue?: number
  totalPrice: number
  additions?: Array<{ id: number; title: string; koef: number }>
}

// ─── API функции ───

/**
 * Создать заказ.
 * Вызывается когда покупатель нажимает "Оплатить" в калькуляторе.
 */
export async function createOrder(data: CreateOrderData): Promise<Order> {
  return apiClient<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * Получить мои заказы.
 * Заменяет хардкод из OrdersData.tsx.
 */
export async function getMyOrders(): Promise<Order[]> {
  return apiClient<Order[]>("/orders")
}

/**
 * Получить детали заказа.
 */
export async function getOrderById(id: number): Promise<Order> {
  return apiClient<Order>(`/orders/${id}`)
}

/**
 * Отменить заказ (только PENDING).
 */
export async function cancelOrder(id: number): Promise<Order> {
  return apiClient<Order>(`/orders/${id}`, {
    method: "DELETE",
  })
}
