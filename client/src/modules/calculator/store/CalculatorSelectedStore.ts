import { create, type StateCreator } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { CalculatorData as ranks } from "../data/CalculatorData"
import { type Rank } from "../types"

interface IActions {
  handleSelectFirstRank: (firstSelectRank: Rank) => void
  handleSelectSecondRank: (secondSelectRank: Rank) => void
  setIsOpenFirst: (isOpenFirst: boolean) => void
  setIsOpenSecond: (isOpenSecond: boolean) => void
}

interface IInitialState {
  firstSelectRank: Rank | null
  secondSelectRank: Rank | null
  isOpenFirst: boolean
  isOpenSecond: boolean
  ranks: Rank[]
}

interface ICalcSelectionsStore extends IActions, IInitialState {}

const initialState: IInitialState = {
  firstSelectRank: null,
  secondSelectRank: null,
  isOpenFirst: false,
  isOpenSecond: false,
  ranks: ranks,
}

const SelectsStore: StateCreator<
  ICalcSelectionsStore,
  [["zustand/immer", never], ["zustand/devtools", never], ["zustand/persist", unknown]]
> = set => ({
  ...initialState,
  handleSelectFirstRank: (rank: Rank) =>
    set(
      {
        firstSelectRank: rank,
        secondSelectRank: null,
        isOpenFirst: false,
        isOpenSecond: false,
      },
      false,
      "handleSelectFirstRank"
    ),
  handleSelectSecondRank: (rank: Rank) =>
    set(
      {
        secondSelectRank: rank,
        isOpenSecond: false,
      },
      false,
      "handleSelectSecondRank"
    ),
  setIsOpenFirst: (isOpenFirst: boolean) =>
    set(
      state => {
        state.isOpenFirst = isOpenFirst
      },
      false,
      "setIsOpenFirst"
    ),
  setIsOpenSecond: (isOpenSecond: boolean) =>
    set(
      state => {
        state.isOpenSecond = isOpenSecond
      },
      false,
      "setIsOpenSecond"
    ),
})

const useSelectsStore = create<ICalcSelectionsStore>()(
  immer(
    devtools(
      persist(SelectsStore, {
        name: "selects-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: state => ({
          firstSelectRank: state.firstSelectRank,
          secondSelectRank: state.secondSelectRank,
          ranks: state.ranks,
        }),
      })
    )
  )
)
export const useRanks = () => useSelectsStore(state => state.ranks)

export const useFirstSelectedRank = () => useSelectsStore(state => state.firstSelectRank)

export const useSecondSelectedRank = () => useSelectsStore(state => state.secondSelectRank)

export const useIsOpenFirst = () => useSelectsStore(state => state.isOpenFirst)

export const useIsOpenSecond = () => useSelectsStore(state => state.isOpenSecond)

export const handleSelectFirstRank = (rank: Rank) =>
  useSelectsStore.getState().handleSelectFirstRank(rank)
export const handleSelectSecondRank = (rank: Rank) =>
  useSelectsStore.getState().handleSelectSecondRank(rank)
export const setIsOpenFirst = (isOpenFirst: boolean) =>
  useSelectsStore.getState().setIsOpenFirst(isOpenFirst)
export const setIsOpenSecond = (isOpenSecond: boolean) =>
  useSelectsStore.getState().setIsOpenSecond(isOpenSecond)
