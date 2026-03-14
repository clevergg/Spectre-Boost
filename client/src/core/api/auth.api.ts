/**
 * Auth API — функции для работы с авторизацией.
 *
 * Каждая функция — обёртка над apiClient для конкретного эндпоинта.
 * Так контроллеры/сторы не знают про URL и HTTP-методы.
 */

import { apiClient, setAccessToken } from "./client"

// ─── Типы ───

// Данные которые возвращает Telegram Login Widget
export interface TelegramAuthData {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

// Что возвращает бэкенд после успешного входа
export interface AuthResponse {
  accessToken: string
  user: UserData
}

// Данные пользователя
export interface UserData {
  id: number
  telegramId: string
  username: string | null
  firstName: string | null
  lastName: string | null
  photoUrl: string | null
  role: "CUSTOMER" | "WORKER" | "ADMIN"
  isActive: boolean
  createdAt: string
}

// ─── API функции ───

/**
 * Авторизация через Telegram.
 * Отправляет данные от Telegram Login Widget на бэкенд.
 * Бэкенд верифицирует, создаёт/обновляет юзера, возвращает JWT.
 */
export async function loginWithTelegram(
  data: TelegramAuthData
): Promise<AuthResponse> {
  const result = await apiClient<AuthResponse>("/auth/telegram", {
    method: "POST",
    body: JSON.stringify(data),
  })

  // Сохраняем access token в памяти
  setAccessToken(result.accessToken)

  return result
}

/**
 * Получить текущего пользователя.
 * Вызывается при загрузке приложения чтобы проверить
 * есть ли активная сессия (через refresh cookie).
 */
export async function getMe(): Promise<UserData> {
  return apiClient<UserData>("/auth/me")
}

/**
 * Обновить access token.
 * apiClient делает это автоматически при 401,
 * но можно вызвать вручную при инициализации.
 */
export async function refreshToken(): Promise<string | null> {
  try {
    const result = await apiClient<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
    })

    if (result.accessToken) {
      setAccessToken(result.accessToken)
      return result.accessToken
    }

    return null
  } catch {
    return null
  }
}

/**
 * Выход — очищает refresh cookie на бэке и token в памяти.
 */
export async function logout(): Promise<void> {
  try {
    await apiClient("/auth/logout", { method: "POST" })
  } finally {
    setAccessToken(null)
  }
}
