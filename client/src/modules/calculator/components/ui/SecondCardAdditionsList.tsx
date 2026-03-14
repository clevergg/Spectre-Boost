import { useItems } from "../../store/CalculatorAdditionsStore"

export const SecondCardAdditionsList = () => {
  const additions = useItems()
  return (
    <ul className='w-full px-5 overflow-hidden grid grid-cols-1 gap-3'>
      {additions.map((item, index) => (
        <li
          key={index}
          className={`flex items-center border-2 bg-transparent border-none min-h-[25px] gap-4`}
        >
          <p
            className={`text-black px-3 h-full rounded-4xl font-gilroy text-[13px] min-w-[70px] justify-center items-center flex ${
              item.isActive && index !== 0 ? "bg-[#AF5061] font-extrabold" : "bg-white"
            }`}
          >
            {!item.isActive ? <>0%</> : <>{item.value}</>}
          </p>

          <h3 className={`text-white font-gilroyMedium text-[clamp(0.85rem,1.1vw,1.1rem)]`}>
            {item.title}
          </h3>
        </li>
      ))}
    </ul>
  )
}
