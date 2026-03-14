import star from "../assets/star.svg"

export const HeroStar = () => {
  return (
    <>
      <img
        src={star}
        alt='star'
        loading='lazy'
        className='absolute max-sm:w-[22%] max-md:w-[18%] max-xl:w-[16%] max-xl:right-[17%] max-md:top-[-69px] max-sm:top-[-59px] -top-20 max-lg:top-[-70px] max-md:right-[16%] max-sm:right-[14%] right-[20%]'
      />
    </>
  )
}
