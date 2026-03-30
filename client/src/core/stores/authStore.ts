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

interface IAuthState {
  user: UserData | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface IAuthActions {
  login: (data: TelegramAuthData) => Promise<void>
  loginWithCode: (accessToken: string, user: UserData) => void
  logout: () => Promise<void>
  initAuth: () => Promise<void>
}

interface IAuthStore extends IAuthState, IAuthActions {}

const initialState: IAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

const authStoreCreator: StateCreator<
  IAuthStore,
  [["zustand/immer", never], ["zustand/devtools", never]]
> = (set) => ({
  ...initialState,

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
   * Вход через код — вызывается когда код подтверждён.
   */
  loginWithCode: (accessToken: string, user: UserData) => {
    setAccessToken(accessToken)
    set(
      (state) => {
        state.user = user
        state.isAuthenticated = true
        state.isLoading = false
      },
      false,
      "auth/loginWithCode"
    )
  },

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

  initAuth: async () => {
    try {
      const token = await refreshToken()
      if (token) {
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

export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated)
export const useIsAuthLoading = () =>
  useAuthStore((state) => state.isLoading)

export const login = (data: TelegramAuthData) =>
  useAuthStore.getState().login(data)
export const loginWithCode = (accessToken: string, user: any) =>
  useAuthStore.getState().loginWithCode(accessToken, user)
export const logout = () => useAuthStore.getState().logout()
export const initAuth = () => useAuthStore.getState().initAuth()
