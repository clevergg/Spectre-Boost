/**
 * SecondCardAdditionsList — список выбранных доп. услуг во второй карточке.
 * Показывает все услуги с их статусом (активна/нет).
 */

import { useItems } from "../../store/CalculatorAdditionsStore"

export const SecondCardAdditionsList = () => {
  const additions = useItems()

  return (
    <ul className='w-full px-5 grid grid-cols-1 gap-3'>
      {additions.map((item) => (
        <li
          key={item.id}
          className='flex items-center gap-4 min-h-[30px]'
        >
          <p
            className={`text-black px-3 py-1 rounded-4xl font-gilroy text-[13px] min-w-[70px] text-center shrink-0 ${
              item.isActive && item.koef > 0
                ? "bg-[#AF5061] font-extrabold"
                : item.isActive
                  ? "bg-white"
                  : "bg-gray-700 text-gray-400"
            }`}
          >
            {item.isActive ? item.value : "—"}
          </p>

          <h3
            className={`font-gilroyMedium text-[clamp(0.85rem,1.1vw,1.1rem)] ${
              item.isActive ? "text-white" : "text-white/40"
            }`}
          >
            {item.title}
          </h3>
        </li>
      ))}
    </ul>
  )
}
