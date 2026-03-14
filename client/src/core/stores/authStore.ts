/**
 * Auth Store — управление авторизацией.
 *
 * Заменяет isAuthorized из HeaderStore на полноценную авторизацию.
 *
 * Ключевой момент: access token хранится НЕ в сторе и НЕ в localStorage,
 * а в переменной внутри client.ts. Store хранит только данные юзера
 * и флаг isAuthenticated.
 *
 * При перезагрузке страницы:
 * 1. Store пустой (isAuthenticated = false)
 * 2. Вызывается initAuth()
 * 3. initAuth() отправляет POST /auth/refresh (cookie прикладывается автоматически)
 * 4. Если refresh token валиден — получаем новый access token + данные юзера
 * 5. Store обновляется, isAuthenticated = true
 */

import { create, type StateCreator } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import {
  loginWithTelegram,
  logout as apiLogout,
  refreshToken,
  getMe,
  type TelegramAuthData,
  type UserData,
} from "../api/auth.api"
import { setAccessToken } from "../api/client"

// ─── Интерфейсы ───

interface IAuthState {
  user: UserData | null
  isAuthenticated: boolean
  isLoading: boolean // для показа лоадера при инициализации
}

interface IAuthActions {
  login: (data: TelegramAuthData) => Promise<void>
  logout: () => Promise<void>
  initAuth: () => Promise<void>
}

interface IAuthStore extends IAuthState, IAuthActions {}

// ─── Store ───

const initialState: IAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // true при старте — пока не проверим сессию
}

const authStoreCreator: StateCreator<
  IAuthStore,
  [["zustand/immer", never], ["zustand/devtools", never]]
> = (set) => ({
  ...initialState,

  /**
   * Вход через Telegram.
   * Вызывается после того как Telegram Login Widget вернул данные.
   */
  login: async (data: TelegramAuthData) => {
    try {
      const result = await loginWithTelegram(data)
      set(
        (state) => {
          state.user = result.user
          state.isAuthenticated = true
          state.isLoading = false
        },
        false,
        "auth/login"
      )
    } catch (error) {
      console.error("Login failed:", error)
      set(
        (state) => {
          state.user = null
          state.isAuthenticated = false
          state.isLoading = false
        },
        false,
        "auth/loginFailed"
      )
      throw error
    }
  },

  /**
   * Выход.
   * Очищает cookie на бэке, token в памяти, и store.
   */
  logout: async () => {
    try {
      await apiLogout()
    } finally {
      set(
        (state) => {
          state.user = null
          state.isAuthenticated = false
          state.isLoading = false
        },
        false,
        "auth/logout"
      )
    }
  },

  /**
   * Инициализация при загрузке приложения.
   * Пытается восстановить сессию через refresh token cookie.
   */
  initAuth: async () => {
    try {
      // Пробуем обновить access token через cookie
      const token = await refreshToken()

      if (token) {
        // Токен есть — получаем данные юзера
        const user = await getMe()
        set(
          (state) => {
            state.user = user
            state.isAuthenticated = true
            state.isLoading = false
          },
          false,
          "auth/initSuccess"
        )
      } else {
        // Нет валидной сессии
        set(
          (state) => {
            state.isLoading = false
          },
          false,
          "auth/initNoSession"
        )
      }
    } catch {
      set(
        (state) => {
          state.user = null
          state.isAuthenticated = false
          state.isLoading = false
        },
        false,
        "auth/initFailed"
      )
    }
  },
})

const useAuthStore = create<IAuthStore>()(
  immer(devtools(authStoreCreator))
)

// ─── Селекторы (как в твоих других сторах) ───

export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated)
export const useIsAuthLoading = () =>
  useAuthStore((state) => state.isLoading)

// ─── Экшены ───

export const login = (data: TelegramAuthData) =>
  useAuthStore.getState().login(data)
export const logout = () => useAuthStore.getState().logout()
export const initAuth = () => useAuthStore.getState().initAuth()
