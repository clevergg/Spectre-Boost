import type { showRankDiv } from "../../types"

export const ShowRankDiv = ({ imageSrc, rating, rankName }: showRankDiv) => {
  return (
    <div className='flex items-center gap-2'>
      <img src={imageSrc} alt={rankName} className='h-[60px] lg:h-[50px]' />
      <div className='text-white font-gilroy'>
        <p className='text-[clamp(0.9rem,1.05vw,1.1rem)] font-semibold'>{rankName}</p>
        <p className='text-gray text-[clamp(0.9rem,1vw,1rem)]'>{rating}</p>
      </div>
    </div>
  )
}
