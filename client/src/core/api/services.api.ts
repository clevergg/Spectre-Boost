/**
 * Services API — каталог игр и услуг.
 * Публичные эндпоинты (без авторизации).
 */

import { apiClient } from "./client"

// ─── Типы ───

export interface GameCategory {
  id: number
  name: string
  description: string | null
  services: ServiceItem[]
}

export interface ServiceItem {
  id: number
  name: string
  description: string
  basePrice: number
  pricePerUnit: number | null
  minUnits: number | null
  maxUnits: number | null
  serviceType: {
    id: number
    name: string
  }
}

// ─── API функции ───

/**
 * Все категории игр с услугами.
 * Используется для каталога на странице Services.
 */
export async function getCategories(): Promise<GameCategory[]> {
  return apiClient<GameCategory[]>("/services/categories")
}

/**
 * Услуги конкретной игры.
 */
export async function getCategoryById(id: number): Promise<GameCategory> {
  return apiClient<GameCategory>(`/services/categories/${id}`)
}

/**
 * Детали конкретной услуги.
 */
export async function getServiceById(id: number): Promise<ServiceItem> {
  return apiClient<ServiceItem>(`/services/${id}`)
}
