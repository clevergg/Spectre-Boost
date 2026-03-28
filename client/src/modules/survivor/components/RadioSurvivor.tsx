import { useBoostVariant, changeBoostVariant } from "../store/SurvivorStore"

export const RadioSurvivor = () => {
  const boostType = useBoostVariant()
  return (
    <div className='flex w-full gap-2 md:gap-4 pt-1 px-[calc(0.5rem+1.5vw)]'>
      <label
        className={`flex items-center gap-2 px-3 sm:px-5 py-3 rounded-xl border cursor-pointer transition-colors flex-1 ${
          boostType === "survivor_pts"
            ? "border-purple-500 bg-purple-500/10 text-white"
            : "border-gray text-gray-400 hover:border-gray-500"
        }`}
      >
        <input
          type='radio'
          name='boostType'
          value='survivor_pts'
          checked={boostType === "survivor_pts"}
          onChange={() => changeBoostVariant("survivor_pts")}
          className='hidden'
        />
        <span
          className={`w-3 shrink-0 h-3 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center ${
            boostType === "survivor_pts" ? "border-purple-500" : "border-gray-500"
          }`}
        >
          {boostType === "survivor_pts" && <span className='w-2 h-2 rounded-full bg-purple-500' />}
        </span>
        <span className='font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>Буст до ПТС</span>
      </label>

      <label
        className={`flex items-center gap-2 px-3 sm:px-5 py-3 rounded-xl border cursor-pointer transition-colors flex-1 ${
          boostType === "survivor_full"
            ? "border-purple-500 bg-purple-500/10 text-white"
            : "border-gray text-gray-400 hover:border-gray-500"
        }`}
      >
        <input
          type='radio'
          name='boostType'
          value='survivor_full'
          checked={boostType === "survivor_full"}
          onChange={() => changeBoostVariant("survivor_full")}
          className='hidden'
        />
        <span
          className={`w-3 h-3 shrink-0 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center ${
            boostType === "survivor_full" ? "border-purple-500" : "border-gray-500"
          }`}
        >
          {boostType === "survivor_full" && (
            <span className='w-2 h-2 rounded-full bg-purple-500' />
          )}
        </span>
        <span className='font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>Полный надзор</span>
      </label>
    </div>
  )
}
