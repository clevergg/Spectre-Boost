import { apiClient, setAccessToken } from "./client"

// ─── Типы ───

export interface TelegramAuthData {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export interface AuthResponse {
  accessToken: string
  user: UserData
}

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

export interface LoginCodeResponse {
  code: string
  expiresIn: number
}

export interface CodeCheckResponse {
  confirmed: boolean
  accessToken?: string
  user?: UserData
}

// ─── API функции ───

/**
 * Генерировать код для авторизации через бота.
 */
export async function generateLoginCode(): Promise<LoginCodeResponse> {
  return apiClient<LoginCodeResponse>("/auth/code", {
    method: "POST",
  })
}

/**
 * Проверить подтверждён ли код.
 */
export async function checkLoginCode(code: string): Promise<CodeCheckResponse> {
  return apiClient<CodeCheckResponse>("/auth/code/check", {
    method: "POST",
    body: JSON.stringify({ code }),
  })
}

/**
 * Авторизация через Telegram Login Widget (фоллбэк).
 */
export async function loginWithTelegram(
  data: TelegramAuthData
): Promise<AuthResponse> {
  const result = await apiClient<AuthResponse>("/auth/telegram", {
    method: "POST",
    body: JSON.stringify(data),
  })
  setAccessToken(result.accessToken)
  return result
}

export async function getMe(): Promise<UserData> {
  return apiClient<UserData>("/auth/me")
}

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

export async function logout(): Promise<void> {
  try {
    await apiClient("/auth/logout", { method: "POST" })
  } finally {
    setAccessToken(null)
  }
}
