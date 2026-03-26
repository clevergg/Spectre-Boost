/**
 * RatingInput — инпут рейтинга с автоматической карточкой ранга.
 *
 * Юзер вводит число → карточка ранга подсвечивается автоматически.
 * Например: ввёл 1500 → показывается иконка Серебро.
 */

import { getRankByRating, MIN_RATING, MAX_RATING } from "../data/CalculatorData"

interface RatingInputProps {
  label: string
  placeholder: string
  value: number
  onChange: (value: number) => void
  min?: number
}

export const RatingInput = ({
  label,
  placeholder,
  value,
  onChange,
  min = MIN_RATING,
}: RatingInputProps) => {
  const rank = value > 0 ? getRankByRating(value) : null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value

    // Пустой инпут → 0
    if (raw === "") {
      onChange(0)
      return
    }

    const num = parseInt(raw, 10)
    if (isNaN(num)) return

    // Ограничиваем диапазон
    const clamped = Math.max(min, Math.min(MAX_RATING, num))
    onChange(clamped)
  }

  return (
    <div className='bg-transparent w-full border border-[#414141] rounded-[11px] py-4 px-5 flex items-center gap-4'>
      {/* Иконка ранга */}
      <div className='w-[50px] h-[50px] flex items-center justify-center shrink-0'>
        {rank ? (
          <img
            src={rank.image}
            alt={rank.name}
            className='w-fit h-[45px] object-cover'
          />
        ) : (
          <div className='w-[45px] h-[45px] rounded-full border border-[#414141] flex items-center justify-center'>
            <span className='text-gray text-lg'>?</span>
          </div>
        )}
      </div>

      {/* Инпут + лейбл */}
      <div className='flex flex-col gap-1 flex-1'>
        <label className='text-gray text-[clamp(0.85rem,1vw,1rem)] font-gilroy'>
          {label}
        </label>
        <input
          type='number'
          value={value || ""}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={MAX_RATING}
          className='bg-transparent text-white font-gilroy text-[clamp(1.1rem,1.3vw,1.3rem)] font-semibold outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
        />
      </div>

      {/* Название ранга */}
      {rank && (
        <div className='text-right shrink-0'>
          <p className='text-white font-gilroy text-[clamp(0.9rem,1.1vw,1.1rem)] font-semibold'>
            {rank.name}
          </p>
          <p className='text-gray text-[clamp(0.75rem,0.85vw,0.85rem)] font-gilroy'>
            {rank.pricePerHundred}₽/100
          </p>
        </div>
      )}
    </div>
  )
}
