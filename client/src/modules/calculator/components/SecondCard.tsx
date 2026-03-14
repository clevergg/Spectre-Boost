import { useEffect } from "react"
import { GoClockFill } from "react-icons/go"
import { LiaArrowRightSolid } from "react-icons/lia"
import { changeAmount, useItems } from "../store/CalculatorAdditionsStore"
import { useFirstSelectedRank, useSecondSelectedRank } from "../store/CalculatorSelectedStore"
import { calculator } from "../services/Calculator"
import { SecondCardTitle } from "./ui/Titles"
import { ShowRankTemplate } from "./ui/ShowRankTemplate"
import { SecondCardAdditionsList } from "./ui/SecondCardAdditionsList"
import { ShowPrice } from "./ui/ShowPrice"

export const SecondCard = () => {
  const items = useItems()
  const selectedRankFirst = useFirstSelectedRank()
  const selectedRankSecond = useSecondSelectedRank()

  useEffect(() => {
    calculator.calculatePrice({ selectedRankFirst, selectedRankSecond, items })
  }, [selectedRankFirst, selectedRankSecond, items, changeAmount])

  return (
    <article className='max-lg:w-full bg-transparent border border-gray w-[40%] rounded-xl shadow-md h-full flex flex-col'>
      <SecondCardTitle />

      <div className='bg-[#0A0A0A] w-full my-10 h-[70px]'>
        {selectedRankFirst && selectedRankSecond && (
          <div className='flex flex-row items-center px-5 justify-center h-full gap-3'>
            <ShowRankTemplate selectedRank={selectedRankFirst} />
            <LiaArrowRightSolid className='w-8 h-8 text-white' />
            <ShowRankTemplate selectedRank={selectedRankSecond} />
          </div>
        )}
      </div>
      <SecondCardAdditionsList />
      <div className='bg-[#0A0A0A] my-10 w-full h-[55px] flex items-center justify-center'>
        <p className='flex flex-row items-center gap-2 text-white'>
          {" "}
          <GoClockFill className='w-5 h-5' /> Время выполнения: ~5 дней
        </p>
      </div>

      <ShowPrice />
    </article>
  )
}
