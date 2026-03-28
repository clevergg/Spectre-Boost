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

interface ITopFiftyStore extends IActions, IInitialState {}

const BOOST_PRICES: Record<BoostType, number> = {
  top50onetime: 30000,
  top50continious: 45000,
}

const initialState: IInitialState = {
  amount: BOOST_PRICES["top50onetime"],
  boostVariant: "top50onetime",
}

const TopFiftyStore: StateCreator<
  ITopFiftyStore,
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
        state.amount = BOOST_PRICES[boostVariant]
      },
      false,
      "setBoostVariant"
    )
  },
})

const useTopFiftyStore = create<ITopFiftyStore>()(
  immer(
    devtools(
      persist(TopFiftyStore, {
        name: "top-fifty-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: state => ({ items: state.amount }),
      })
    )
  )
)

export const useAmount = () => useTopFiftyStore(state => state.amount)
export const useBoostVariant = () => useTopFiftyStore(state => state.boostVariant)

export const changeAmount = (amount: number) => useTopFiftyStore.getState().changeAmount(amount)
export const changeBoostVariant = (boostVariant: BoostType) =>
  useTopFiftyStore.getState().changeBoostType(boostVariant)
