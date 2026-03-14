import { useMemo } from "react"
import {
  handleSelectFirstRank,
  setIsOpenFirst,
  useFirstSelectedRank,
  useIsOpenFirst,
  useRanks,
} from "../store/CalculatorSelectedStore"
import { TemplateSelectsCards } from "./ui/TemplateSelectCards"

export const FirstSelectRank = () => {
  const ranks = useRanks()
  const selectedRankFirst = useFirstSelectedRank()
  const isOpenFirst = useIsOpenFirst()
  const filteredFirstRanks = useMemo(
    () => ranks.filter(rank => rank.id !== 6 && rank.id !== selectedRankFirst?.id),
    [ranks]
  )

  const firstSelectRankProps = {
    id: 1,
    funcSelectRank: handleSelectFirstRank,
    selectedRank: selectedRankFirst,
    setIsOpenClose: setIsOpenFirst,
    isOpenSelect: isOpenFirst,
    filteredRanks: filteredFirstRanks,
  }

  return <TemplateSelectsCards {...firstSelectRankProps} />
}
