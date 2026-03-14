import { create, type StateCreator } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { DopServicesData as additionsItems } from "../data/CalculatorData"
import { type additionItem } from "../types"

interface IActions {
  handleItemClick: (id: number) => void
  changeAmount: (amount: number) => void
}

interface IInitialState {
  items: additionItem[]
  amount: number
}

interface ICalcAdditionsStore extends IActions, IInitialState {}

const initialState: IInitialState = {
  items: additionsItems,
  amount: 0,
}

const СalculatorStore: StateCreator<
  ICalcAdditionsStore,
  [["zustand/immer", never], ["zustand/devtools", never], ["zustand/persist", unknown]]
> = set => ({
  ...initialState,
  handleItemClick: (id: number) => {
    set(
      state => {
        const item = state.items.find(item => item.id === id)

        if (item) {
          item.isActive = !item.isActive
        }
      },
      false,
      "additionsSelect"
    )
  },
  changeAmount: (amount: number) => {
    set(
      state => {
        state.amount = amount
      },
      false,
      "setAmount"
    )
  },
})

const useCalcAdditionsStore = create<ICalcAdditionsStore>()(
  immer(
    devtools(
      persist(СalculatorStore, {
        name: "Сalculator-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: state => ({ items: state.items }),
      })
    )
  )
)

export const useItems = () => useCalcAdditionsStore(state => state.items)
export const useAmount = () => useCalcAdditionsStore(state => state.amount)

export const handleItemClick = (id: number) => useCalcAdditionsStore.getState().handleItemClick(id)

export const changeAmount = (amount: number) =>
  useCalcAdditionsStore.getState().changeAmount(amount)
