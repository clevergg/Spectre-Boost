import { type Review } from "../types"

export const SliderDeskCard = ({ review }: { review: Review }) => {
  return (
    <div
      className={`h-[300px] w-[450px] mx-3 shrink-0 text-wrap-balance border border-gray rounded-2xl shadow-md p-5 bg-[#0E0E0E] `}
    >
      <div className='flex items-center mb-4 w-fit'>
        <img
          src={review.img}
          alt={review.author}
          className='p-2 w-16 h-16 rounded-full'
          loading='lazy'
        />
        <div className='flex flex-col gap-1'>
          <h3 className='text-white text-lg font-semibold'>{review.author}</h3>
          <span className='text-white'>★ {review.rating}</span>
          <span className='text-gray-400 text-sm'>{review.date}</span>
        </div>
      </div>
      <p className='text-white text-left'>{review.text}</p>
    </div>
  )
}
