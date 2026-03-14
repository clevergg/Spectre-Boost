/**
 * API Client — обёртка над fetch для работы с бэкендом.
 *
 * Что делает:
 * 1. Подставляет BASE_URL ко всем запросам
 * 2. Добавляет JWT токен в заголовок Authorization
 * 3. Автоматически обновляет протухший access token
 * 4. Парсит JSON-ответы
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

// ─── Хранение access token в памяти (не в localStorage!) ───
// Почему в памяти? Потому что localStorage доступен любому JS на странице.
// Если на сайт попадёт XSS-скрипт — он украдёт токен из localStorage.
// Из переменной в памяти украсть сложнее.
// Минус: при перезагрузке страницы токен теряется.
// Решение: refresh token в httpOnly cookie автоматически восстанавливает его.

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

// ─── Основная функция запросов ───

interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: string
}

/**
 * apiClient — универсальная функция для запросов к API.
 *
 * @param endpoint - путь без базового URL, например "/orders"
 * @param options  - стандартные опции fetch (method, body, headers...)
 *
 * Пример:
 *   const orders = await apiClient<Order[]>('/orders')
 *   const order = await apiClient<Order>('/orders', {
 *     method: 'POST',
 *     body: JSON.stringify(data),
 *   })
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  }

  // Подставляем JWT токен если есть
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // ВАЖНО: отправлять cookies (refresh token)
  })

  // Если 401 — пробуем обновить токен и повторить запрос
  if (response.status === 401 && endpoint !== "/auth/refresh") {
    const refreshed = await refreshAccessToken()

    if (refreshed) {
      // Повторяем оригинальный запрос с новым токеном
      headers["Authorization"] = `Bearer ${accessToken}`
      const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      })
      return handleResponse<T>(retryResponse)
    }

    // Не удалось обновить — разлогиниваем
    setAccessToken(null)
    window.location.href = "/"
    throw new Error("Session expired")
  }

  return handleResponse<T>(response)
}

// ─── Обработка ответа ───

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Network error",
    }))
    throw new ApiError(
      error.message || `HTTP ${response.status}`,
      response.status
    )
  }

  const json: ApiResponse<T> = await response.json()
  return json.data // TransformInterceptor на бэке оборачивает в { success, data, timestamp }
}

// ─── Обновление токена ───

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // cookie с refresh token
    })

    if (!response.ok) return false

    const json = await response.json()
    const newToken = json.data?.accessToken

    if (newToken) {
      setAccessToken(newToken)
      return true
    }

    return false
  } catch {
    return false
  }
}

// ─── Кастомный класс ошибки ───

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = "ApiError"
  }
}
