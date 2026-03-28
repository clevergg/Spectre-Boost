import { useBoostVariant, changeBoostVariant } from "../store/TopFiftyStore"

export const RadioTopFifty = () => {
  const boostType = useBoostVariant()
  return (
    <div className='flex w-full gap-2 md:gap-4 pt-1 px-[calc(0.5rem+1.5vw)]'>
      <label
        className={`flex items-center gap-2 px-3 sm:px-5 rounded-xl border cursor-pointer transition-colors flex-1 ${
          boostType === "top50onetime"
            ? "border-purple-500 bg-purple-500/10 text-white"
            : "border-gray text-gray-400 hover:border-gray-500"
        }`}
      >
        <input
          type='radio'
          name='boostType'
          value='top50onetime'
          checked={boostType === "top50onetime"}
          onChange={() => changeBoostVariant("top50onetime")}
          className='hidden'
        />
        <span
          className={`w-3 shrink-0 h-3 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center ${
            boostType === "top50onetime" ? "border-purple-500" : "border-gray-500"
          }`}
        >
          {boostType === "top50onetime" && <span className='w-2 h-2 rounded-full bg-purple-500' />}
        </span>
        <span className='font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>Выживший разовый</span>
      </label>

      <label
        className={`flex items-center gap-2 px-3 sm:px-5 py-3 rounded-xl border cursor-pointer transition-colors flex-1 ${
          boostType === "top50continious"
            ? "border-purple-500 bg-purple-500/10 text-white"
            : "border-gray text-gray-400 hover:border-gray-500"
        }`}
      >
        <input
          type='radio'
          name='boostType'
          value='top50continious'
          checked={boostType === "top50continious"}
          onChange={() => changeBoostVariant("top50continious")}
          className='hidden'
        />
        <span
          className={`w-3 h-3 shrink-0 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center ${
            boostType === "top50continious" ? "border-purple-500" : "border-gray-500"
          }`}
        >
          {boostType === "top50continious" && (
            <span className='w-2 h-2 rounded-full bg-purple-500' />
          )}
        </span>
        <span className='font-gilroy text-[clamp(0.9rem,1vw,1rem)]'>Выживший на весь сезон</span>
      </label>
    </div>
  )
}
