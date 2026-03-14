import { type KeyboardEvent } from "react"
import type { Rank } from "../../types"
interface SelectListTemplateInterface {
  filteredRanks: Rank[]
  funcSelectRank: (rank: Rank) => void
  selectedRank: Rank | null
}

export const SelectListTemplate = ({
  filteredRanks,
  funcSelectRank,
  selectedRank,
}: SelectListTemplateInterface) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>, rank: Rank): void => {
    if (event.key === "Enter") {
      event.preventDefault()
      funcSelectRank(rank)
    }
  }

  return (
    <div className='relative lgx:absolute z-10 w-full gap-3 bg-transparent border border-gray-700 overflow-hidden mt-2 rounded-[11px]'>
      <ul className='max-h-53 overflow-auto scrollbar-hide '>
        {filteredRanks.map((rank: Rank) => (
          <li
            key={rank.id}
            onClick={() => funcSelectRank(rank)}
            onKeyDown={event => handleKeyDown(event, rank)}
            className={`bg-black flex items-center px-4 py-3 cursor-pointer border-gray hover:bg-gray border space-x-5 ${
              selectedRank?.id === rank.id ? "border-pink-gradient1/70" : null
            }`}
          >
            <>
              <img
                src={rank.image}
                alt={rank.name}
                className='w-fit h-[45px] shrink-0 object-cover'
              />
              <p className='text-white font-gilroy text-[clamp(1.1rem,1.3vw,1.3rem)] font-medium'>
                {rank.name}
              </p>
            </>
          </li>
        ))}
      </ul>
    </div>
  )
}
