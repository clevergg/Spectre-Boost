/**
 * SliderDeskCard — обновлённая карточка отзыва.
 *
 * БЫЛО: img всегда string (хардкод SVG)
 * СТАЛО: img может быть null (нет аватара в TG) → показываем плейсхолдер
 */

import { type Review } from "../types"

export const SliderDeskCard = ({ review }: { review: Review }) => {
  return (
    <div
      className={`h-[300px] w-[450px] mx-3 shrink-0 text-wrap-balance border border-gray rounded-2xl shadow-md p-5 bg-[#0E0E0E]`}
    >
      <div className='flex items-center mb-4 w-fit'>
        {/* Аватар или плейсхолдер */}
        {review.img ? (
          <img
            src={review.img}
            alt={review.author}
            className='p-2 w-16 h-16 rounded-full object-cover'
            loading='lazy'
          />
        ) : (
          <div className='w-16 h-16 rounded-full bg-gradient-to-r from-pink-gradient1 to-pink-gradient2 flex items-center justify-center mx-2 shrink-0'>
            <span className='text-xl font-unbounded text-white'>
              {review.author.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className='flex flex-col gap-1'>
          <h3 className='text-white text-lg font-semibold'>
            {review.author}
          </h3>
          <span className='text-white'>
            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
          </span>
          <span className='text-gray-400 text-sm'>{review.date}</span>
        </div>
      </div>
      <p className='text-white text-left'>{review.text}</p>
    </div>
  )
}
