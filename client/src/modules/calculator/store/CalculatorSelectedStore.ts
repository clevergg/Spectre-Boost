import { create, type StateCreator } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import { MIN_RATING, MAX_RATING, getRankByRating, type RankTiers } from "../data/CalculatorData"
import { type RankTier } from "../types"

interface IActions {
  setStartRating: (rating: number) => void
  setTargetRating: (rating: number) => void
}

interface IInitialState {
  startRating: number
  targetRating: number
}

interface ICalcSelectionsStore extends IActions, IInitialState {}

const initialState: IInitialState = {
  startRating: 0,
  targetRating: 0,
}

const SelectsStore: StateCreator<
  ICalcSelectionsStore,
  [["zustand/immer", never], ["zustand/devtools", never], ["zustand/persist", unknown]]
> = set => ({
  ...initialState,
  setStartRating: (rating: number) =>
    set(
      state => {
        state.startRating = Math.max(MIN_RATING, Math.min(MAX_RATING, rating))
        // Если начальный стал >= конечного, сбрасываем конечный
        if (state.startRating >= state.targetRating) {
          state.targetRating = 0
        }
      },
      false,
      "setStartRating"
    ),
  setTargetRating: (rating: number) =>
    set(
      state => {
        state.targetRating = Math.max(MIN_RATING, Math.min(MAX_RATING, rating))
      },
      false,
      "setTargetRating"
    ),
})

const useSelectsStore = create<ICalcSelectionsStore>()(
  immer(
    devtools(
      persist(SelectsStore, {
        name: "selects-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: state => ({
          startRating: state.startRating,
          targetRating: state.targetRating,
        }),
      })
    )
  )
)

// ─── Селекторы ───
export const useStartRating = () => useSelectsStore(state => state.startRating)
export const useTargetRating = () => useSelectsStore(state => state.targetRating)

// Производные — ранг по рейтингу
export const useStartRank = (): RankTier | null => {
  const rating = useSelectsStore(state => state.startRating)
  return rating > 0 ? getRankByRating(rating) : null
}
export const useTargetRank = (): RankTier | null => {
  const rating = useSelectsStore(state => state.targetRating)
  return rating > 0 ? getRankByRating(rating) : null
}

// ─── Экшены ───
export const setStartRating = (rating: number) =>
  useSelectsStore.getState().setStartRating(rating)
export const setTargetRating = (rating: number) =>
  useSelectsStore.getState().setTargetRating(rating)
