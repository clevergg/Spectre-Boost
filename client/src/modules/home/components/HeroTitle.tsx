import { HeroStar } from "./HeroStar"
export const HomeTitle = () => {
  return (
    <div className='relative inline-block'>
      <h1 className='text-[clamp(2.85rem,9vw,8rem)]/[120%] font-unbounded'>
        <span className='block relative bg-linear-to-r from-[#FFFFFF] to-[#E1E1E1]/69 bg-clip-text text-transparent text-nowrap'>
          ПРОКАЧАЙ
          <HeroStar />
        </span>
        <span className='block bg-linear-to-r from-[#FFFFFF] to-[#E1E1E1]/69 bg-clip-text text-transparent text-nowrap'>
          СВОЙ РАНГ
        </span>
      </h1>
    </div>
  )
}
