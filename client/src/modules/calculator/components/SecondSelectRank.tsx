import { useMemo } from "react"
import {
  handleSelectSecondRank,
  setIsOpenSecond,
  useFirstSelectedRank,
  useIsOpenSecond,
  useRanks,
  useSecondSelectedRank,
} from "../store/CalculatorSelectedStore"
import { TemplateSelectsCards } from "./ui/TemplateSelectCards"

export const SecondSelectRank = () => {
  const selectedRankSecond = useSecondSelectedRank()
  const selectedRankFirst = useFirstSelectedRank()
  const ranks = useRanks()
  const isOpenSecond = useIsOpenSecond()

  const filteredSecondRanks = useMemo(
    () =>
      selectedRankFirst
        ? ranks.filter(rank => selectedRankFirst.id < rank.id && rank.id !== selectedRankSecond?.id)
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedRankFirst]
  )

  const handleSecondSelectOpenClose = () => {
    if (selectedRankFirst) {
      setIsOpenSecond(!isOpenSecond)
    }
  }

  const secondSelectRankProps = {
    id: 2,
    funcSelectRank: handleSelectSecondRank,
    selectedRank: selectedRankSecond,
    setIsOpenClose: handleSecondSelectOpenClose,
    isOpenSelect: isOpenSecond,
    filteredRanks: filteredSecondRanks,
    selectedRankFirst: selectedRankFirst,
  }

  return <TemplateSelectsCards {...secondSelectRankProps} />
}
