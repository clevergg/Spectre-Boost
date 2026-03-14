import { useState } from "react"
import {
  setIsOpenFirst,
  setIsOpenSecond,
  useFirstSelectedRank,
  useSecondSelectedRank,
} from "../../store/CalculatorSelectedStore"
import { SelectsModal } from "../SelectsModal"
import { SelectCardTemplate } from "./SelectCardTemplate"

export const FirstCardSelects = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const handleChangeIsModalOpen = () => {
    setIsModalOpen(prev => !prev)
    setIsOpenFirst(false)
    setIsOpenSecond(false)
  }
  const selectedRankFirst = useFirstSelectedRank()
  const selectedRankSecond = useSecondSelectedRank()
  const id1 = 1
  const id2 = 2
  const isDisabled = id2 && !selectedRankFirst
  return (
    <>
      <div className='flex max-sm:flex-col gap-3 justify-around'>
        <div className='relative w-full'>
          <SelectCardTemplate
            id={id1}
            selectedRank={selectedRankFirst}
            onClickCard={handleChangeIsModalOpen}
          />
        </div>

        <div className='relative w-full'>
          <SelectCardTemplate
            id={id2}
            selectedRank={selectedRankSecond}
            onClickCard={handleChangeIsModalOpen}
            isDisabled={isDisabled}
          />
        </div>
      </div>
      <SelectsModal isModalOpen={isModalOpen} handleChangeIsModalOpen={handleChangeIsModalOpen} />
    </>
  )
}
