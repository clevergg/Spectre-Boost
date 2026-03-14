import type { Rank } from "../../types"
import { ArrowUpDown } from "./ArrowUpDown"

interface SelectCardTemplate {
  id: number
  selectedRank: Rank | null
  onClickCard: () => void
  isDisabled?: boolean
  isOpenSelect?: boolean
}

export const SelectCardTemplate = ({
  id,
  selectedRank,
  isDisabled,
  onClickCard,
  isOpenSelect,
}: SelectCardTemplate) => {
  const titleSelect = id === 1 ? "Начальный ранг" : "Конечный ранг"
  const previewSelect = id === 1 ? "Выберите начальный ранг" : "Выберите конечный ранг"

  return (
    <button
      disabled={isDisabled}
      onClick={onClickCard}
      className={`${isDisabled && id === 2 ? "cursor-not-allowed opacity-70" : "cursor-pointer"} bg-transparent w-full border border-[#414141] rounded-[11px] py-4 gap-3 px-5 text-left flex items-center justify-between`}
    >
      <div className='flex items-center min-h-[55px]'>
        {selectedRank ? (
          <>
            <img
              src={selectedRank.image}
              alt={selectedRank.name}
              className='w-fit h-[45px] object-cover mr-5'
            />
            <div className='flex flex-col gap-1'>
              <p className='text-gray text-[clamp(1rem,1.2vw,1.2rem)]/[90%] font-gilroy'>
                {titleSelect}
              </p>
              <p className='text-white font-gilroy text-[clamp(1rem,1.2vw,1.2rem)]/[90%] font-semibold'>
                {selectedRank.name}
              </p>
            </div>
          </>
        ) : (
          <span className='text-gray font-gilroyMedium text-[clamp(1rem,1.2vw,1.2rem)]'>
            {previewSelect}
          </span>
        )}
      </div>
      <ArrowUpDown isOpenSelect={isOpenSelect} />
    </button>
  )
}
