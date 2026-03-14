/**
 * HeaderStore — обновлённый.
 *
 * БЫЛО: isModalOpen, isBurgerOpen, isAuthorized
 * СТАЛО: isModalOpen, isBurgerOpen (только UI-состояние)
 *
 * isAuthorized УДАЛЁН. Авторизация теперь в authStore.
 * Этот стор отвечает только за визуальное состояние хедера:
 * - Открыта ли модалка входа
 * - Открыт ли бургер-меню на мобилке
 *
 * Также убрал persist — нет смысла сохранять в localStorage
 * состояние "модалка открыта" между перезагрузками страницы.
 * При перезагрузке модалка и бургер должны быть закрыты.
 */

import { create, type StateCreator } from "zustand"
import { devtools } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

interface IActions {
  setIsModalOpen: (isModalOpen: boolean) => void
  setIsBurgerOpen: (isBurgerOpen: boolean) => void
}

interface IInitialState {
  isModalOpen: boolean
  isBurgerOpen: boolean
}

interface IHeaderStore extends IActions, IInitialState {}

const initialState: IInitialState = {
  isModalOpen: false,
  isBurgerOpen: false,
}

const HeaderStore: StateCreator<
  IHeaderStore,
  [["zustand/immer", never], ["zustand/devtools", never]]
> = set => ({
  ...initialState,
  setIsModalOpen: (isModalOpen: boolean) => {
    set(
      state => {
        state.isModalOpen = isModalOpen
      },
      false,
      "isModalOpen"
    )
  },
  setIsBurgerOpen: (isBurgerOpen: boolean) => {
    set(
      state => {
        state.isBurgerOpen = isBurgerOpen
      },
      false,
      "isBurgerOpen"
    )
  },
})

const useHeaderStore = create<IHeaderStore>()(
  immer(devtools(HeaderStore))
)

// ─── Селекторы ───
export const useIsModalOpen = () => useHeaderStore(state => state.isModalOpen)
export const useIsBurgerOpen = () => useHeaderStore(state => state.isBurgerOpen)

// ─── Экшены ───
export const handleChangeIsModalClick = (isModalOpen: boolean) =>
  useHeaderStore.getState().setIsModalOpen(isModalOpen)
export const handleChangeIsBurgerClick = (isBurgerOpen: boolean) =>
  useHeaderStore.getState().setIsBurgerOpen(isBurgerOpen)
