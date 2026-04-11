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
  max?: number
}

export const RatingInput = ({
  label,
  placeholder,
  value,
  onChange,
  min = MIN_RATING,
  max = MAX_RATING,
}: RatingInputProps) => {
  const rank = value > 0 ? getRankByRating(value) : null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value

    if (raw === "") {
      onChange(0)
      return
    }

    if (!/^\d+$/.test(raw)) return

    const num = parseInt(raw, 10)

    if (num > max) {
      onChange(max)
      return
    }

    onChange(num)
  }

  return (
    <div className='bg-transparent font-gilroy w-full border border-[#414141] rounded-[11px] py-4 px-5 flex items-center gap-4'>
      <div className='w-[50px] h-[50px] flex items-center justify-center shrink-0'>
        {rank ? (
          <img src={rank.image} alt={rank.name} className='w-fit h-[45px] object-cover' />
        ) : (
          <div className='w-[45px] h-[45px] rounded-full border border-[#414141] flex items-center justify-center'>
            <span className='text-gray text-lg'>?</span>
          </div>
        )}
      </div>

      <div className='flex flex-col gap-1 flex-1'>
        <label className='text-gray text-[clamp(0.85rem,1vw,1rem)]'>{label}</label>
        <input
          type='text'
          inputMode='numeric'
          value={value || ""}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={4}
          className='bg-transparent text-white text-[clamp(1.1rem,1.3vw,1.3rem)] font-semibold outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
        />
      </div>

      {rank && (
        <div className='text-right shrink-0'>
          <p className='text-white text-[clamp(0.9rem,1.1vw,1.1rem)] font-semibold'>{rank.name}</p>
          <p className='text-gray text-[clamp(0.9rem,0.95vw,0.95rem)]'>
            {rank.pricePerHundred}₽/100
          </p>
        </div>
      )}
    </div>
  )
}
