/**
 * FirstCardAdditions — доп. услуги с тултипами.
 * При наведении на услугу появляется описание.
 */

import { useState } from "react"
import { IoCheckmarkSharp } from "react-icons/io5"
import { useItems, handleItemClick } from "../store/CalculatorAdditionsStore"

export const FirstCardAdditions = () => {
  const items = useItems()
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <div className='w-full mx-auto'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        {items.map((item, index) => (
          <div
            key={index}
            className='relative'
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Карточка услуги */}
            <div
              onClick={() => handleItemClick(item.id)}
              className={`p-4 rounded-xl flex flex-row items-center justify-between border-2 h-[75px] cursor-pointer transition-colors ${
                item.isActive ? "border-pink-gradient1" : "border-gray"
              } bg-black`}
            >
              <div className='flex flex-row items-center gap-2 md:gap-4'>
                <div
                  className={`w-8 h-8 flex justify-center items-center rounded-[5px] shrink-0 ${
                    item.isActive ? "bg-pink-gradient1" : "border-gray border-2"
                  }`}
                >
                  {item.isActive && (
                    <IoCheckmarkSharp className='text-white w-[30px] h-5' />
                  )}
                </div>
                <h3 className='text-white font-gilroyMedium text-[16px]/[100%]'>
                  {item.title}
                </h3>
              </div>

              {item.isActive && (
                <p
                  className={`text-black px-3 py-1.5 rounded-4xl font-gilroy font-bold text-[15px] shrink-0 ${
                    item.isActive && index !== 0
                      ? "bg-[#AF5061]"
                      : "bg-white"
                  }`}
                >
                  {item.value}
                </p>
              )}
            </div>

            {/* Тултип с описанием */}
            {hoveredId === item.id && (
              <div className='absolute z-20 left-0 right-0 -bottom-1 translate-y-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 shadow-xl'>
                <p className='text-white/80 font-gilroy text-[clamp(0.8rem,0.95vw,0.95rem)]'>
                  {item.description}
                </p>
                {item.koef > 0 && (
                  <p className='text-pink-gradient1 font-gilroyMedium text-[clamp(0.75rem,0.85vw,0.85rem)] mt-1'>
                    Стоимость: {item.value} к базовой цене
                  </p>
                )}
                {item.koef === 0 && (
                  <p className='text-green-400 font-gilroyMedium text-[clamp(0.75rem,0.85vw,0.85rem)] mt-1'>
                    Бесплатно
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
