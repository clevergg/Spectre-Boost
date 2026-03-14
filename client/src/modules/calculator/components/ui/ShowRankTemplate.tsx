import type { Rank } from "../../types"

interface ShowRankTemplate {
  selectedRank: Rank
}

export const ShowRankTemplate = ({ selectedRank }: ShowRankTemplate) => {
  return (
    <figure className='flex flex-row items-center'>
      <img src={selectedRank?.image} alt='rank' className='w-[45px] h-[45px] object-cover' />
      <figcaption className='text-[18px]/[100%] font-gilroyMedium font-semibold text-white ml-2'>
        {selectedRank?.name}
      </figcaption>
    </figure>
  )
}
