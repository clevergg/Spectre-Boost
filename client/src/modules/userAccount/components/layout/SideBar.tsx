import { TabData } from "../../data/TabButtonData"
import type { TabType } from "../../types"
import TabButton from "../ui/TabButton"
import { UserProfile } from "../UserProfile"

interface SidebarProps {
  currentTab: TabType
  onTabChange: (tab: TabType) => void
}

const Sidebar = ({ currentTab, onTabChange }: SidebarProps) => {
  return (
    <aside className='h-fit flex flex-col w-full lgx:flex-[1] space-y-3 lgx:space-y-5'>
      <UserProfile />

      <nav className='space-y-2 flex-1 h-full border px-4 py-8 border-white bg-bgblack rounded-[11px]'>
        {TabData.map(item => (
          <TabButton
            key={item.tab}
            tab={item.tab}
            currentTab={currentTab}
            onClick={onTabChange}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
