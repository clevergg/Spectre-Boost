import { create, type StateCreator } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import type { BoostType } from "../types"

interface IActions {
  changeAmount: (amount: number) => void
  changeBoostType: (boostVariant: BoostType) => void
}

interface IInitialState {
  amount: number
  boostVariant: BoostType
}

interface ISurvivorStore extends IActions, IInitialState {}

/**
 * Цены загружаются из БД через API.
 * Эти значения — fallback на случай если API не ответил.
 */
export const SURVIVOR_PRICES: Record<BoostType, number> = {
  survivor_pts: 10000,
  survivor_full: 15000,
}

const initialState: IInitialState = {
  amount: SURVIVOR_PRICES["survivor_pts"],
  boostVariant: "survivor_pts",
}

const survivorStoreCreator: StateCreator<
  ISurvivorStore,
  [["zustand/immer", never], ["zustand/devtools", never], ["zustand/persist", unknown]]
> = set => ({
  ...initialState,
  changeAmount: (amount: number) => {
    set(
      state => {
        state.amount = amount
      },
      false,
      "setAmount"
    )
  },
  changeBoostType: (boostVariant: BoostType) => {
    set(
      state => {
        state.boostVariant = boostVariant
        state.amount = SURVIVOR_PRICES[boostVariant]
      },
      false,
      "setBoostVariant"
    )
  },
})

const useSurvivorStore = create<ISurvivorStore>()(
  immer(
    devtools(
      persist(survivorStoreCreator, {
        name: "survivor-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: state => ({ amount: state.amount }),
      })
    )
  )
)

export const useAmount = () => useSurvivorStore(state => state.amount)
export const useBoostVariant = () => useSurvivorStore(state => state.boostVariant)

export const changeAmount = (amount: number) => useSurvivorStore.getState().changeAmount(amount)
export const changeBoostVariant = (boostVariant: BoostType) =>
  useSurvivorStore.getState().changeBoostType(boostVariant)
