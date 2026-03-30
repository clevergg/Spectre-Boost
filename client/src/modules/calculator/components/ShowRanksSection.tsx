import { LiaArrowRightSolid } from "react-icons/lia"
import {
  useStartRank,
  useStartRating,
  useTargetRank,
  useTargetRating,
} from "../store/CalculatorSelectedStore"
import { ShowRankDiv } from "./ui/ShowRankDiv"

export const ShowRanksSection = () => {
  const startRating = useStartRating()
  const targetRating = useTargetRating()
  const startRank = useStartRank()
  const targetRank = useTargetRank()
  return (
    <div className='bg-[#0A0A0A] w-full my-6 py-3'>
      {startRank && targetRank && startRating < targetRating && (
        <div className='flex flex-row items-center px-5 justify-center h-full gap-3'>
          <ShowRankDiv imageSrc={startRank.image} rankName={startRank.name} rating={startRating} />

          <LiaArrowRightSolid className='w-8 h-8 text-white' />

          <ShowRankDiv
            imageSrc={targetRank.image}
            rankName={targetRank.name}
            rating={targetRating}
          />
        </div>
      )}
    </div>
  )
}
