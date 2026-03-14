import { useMemo, memo } from "react"
import { type TabType } from "../../types"

interface TabButtonProps {
  tab: TabType
  currentTab: TabType
  onClick: (tab: TabType) => void
  icon: string
  label: string
}

const TabButton = ({ tab, currentTab, onClick, icon, label }: TabButtonProps) => {
  const isActive = useMemo(() => currentTab === tab, [tab, currentTab])
  return (
    <button
      onClick={() => onClick(tab)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-300
        ${
          isActive
            ? "bg-gray-100/98 text-black shadow-lg transform scale-102"
            : "text-gray-600 hover:border hover:border-gray-100/90 hover:text-white"
        }
      `}
    >
      <span className='font-gilroyMedium text-[clamp(1.1rem,1.2vw,1.2rem)]'>{icon}</span>
      <span className='font-gilroyMedium text-[clamp(1.1rem,1.2vw,1.2rem)]'>{label}</span>
    </button>
  )
}

export default memo(TabButton)
