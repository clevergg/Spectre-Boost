import { IoCheckmarkSharp } from "react-icons/io5"
import { useItems, handleItemClick } from "../store/CalculatorAdditionsStore"

export const FirstCardAdditions = () => {
  const items = useItems()
  return (
    <div className='w-full mx-auto'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        {items.map((item, index) => (
          <div
            onClick={() => handleItemClick(item.id)}
            key={index}
            className={`p-4 rounded-xl flex flex-row items-center justify-between  border-2 h-[75px] cursor-pointer ${
              item.isActive ? "border-pink-gradient1" : "border-gray"
            } bg-black`}
          >
            <div className='flex flex-row items-center gap-2 md:gap-4'>
              <div
                className={`w-8 h-8 flex justify-center items-center rounded-[5px] ${
                  item.isActive ? "bg-pink-gradient1" : "border-gray border-2"
                }`}
              >
                {item.isActive && <IoCheckmarkSharp className='text-white w-[30px] h-5' />}
              </div>
              <h3 className={`text-white font-gilroyMedium text-[16px]/[100%]`}>{item.title}</h3>
            </div>

            {item.isActive && (
              <p
                className={`text-black px-3 py-1.5 rounded-4xl font-gilroy font-bold text-[15px] ${
                  item.isActive && index !== 0 ? "bg-[#AF5061]" : "bg-white"
                }`}
              >
                {item.value}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
