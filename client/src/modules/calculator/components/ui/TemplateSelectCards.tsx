import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { type Rank } from "../../types"
import { SelectCardTemplate } from "./SelectCardTemplate"
import { SelectListTemplate } from "./SelectListTemplate"

interface SelectsCardsInterface {
  id: number
  funcSelectRank: (rank: Rank) => void
  selectedRank: Rank | null
  setIsOpenClose: (isOpenClose: boolean) => void
  selectedRankFirst?: Rank | null
  isOpenSelect: boolean
  filteredRanks: Rank[]
}

export const TemplateSelectsCards = ({
  id,
  funcSelectRank,
  selectedRank,
  setIsOpenClose,
  selectedRankFirst,
  isOpenSelect,
  filteredRanks,
}: SelectsCardsInterface) => {
  const { pathname } = useLocation()
  const savedPathname = sessionStorage.getItem("pathname")

  useEffect(() => {
    if (savedPathname !== pathname && isOpenSelect) {
      setIsOpenClose(false)
    }
  }, [pathname, savedPathname])

  const isDisabled = id === 2 && !selectedRankFirst

  const handleOpenChangeClick = () => {
    setIsOpenClose(!isOpenSelect)
  }
  return (
    <div className='relative w-full'>
      <SelectCardTemplate
        id={id}
        selectedRank={selectedRank}
        isDisabled={isDisabled}
        onClickCard={handleOpenChangeClick}
        isOpenSelect={isOpenSelect}
      />

      {isOpenSelect && (
        <SelectListTemplate
          filteredRanks={filteredRanks}
          funcSelectRank={funcSelectRank}
          selectedRank={selectedRank}
        />
      )}
    </div>
  )
}
