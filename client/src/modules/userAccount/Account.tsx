import { lazy, useCallback, useState } from "react"
import Sidebar from "./components/layout/SideBar"
import type { TabType } from "./types"

const AccountSettings = lazy(() => import("./pages/AccountPrivacy"))
const AccountOrders = lazy(() => import("./pages/Orders"))
const AccountSupport = lazy(() => import("./pages/Support"))

export const Account = () => {
  const [currentTab, setCurrentTab] = useState<TabType>("account")

  const renderContent = () => {
    switch (currentTab) {
      case "account":
        return <AccountSettings />
      case "orders":
        return <AccountOrders />
      case "support":
        return <AccountSupport />
      default:
        return <Account />
    }
  }

  const handleChangeTab = useCallback((tab: TabType) => {
    setCurrentTab(tab)
  }, [])

  return (
    <div className='pt-[calc(7rem+7vw)] md:pt-[calc(6rem+6vw)] pb-10 flex-1 flex h-full lgx:pt-[calc(5rem+5vw)]'>
      <div className='flex flex-col z-1 lgx:flex-row h-full flex-1 lgx:justify-between max-lgx:space-y-3 transform-gpu md:space-x-3 lgx:space-x-7'>
        <Sidebar currentTab={currentTab} onTabChange={handleChangeTab} />

        <div className='w-full flex flex-1'>{renderContent()}</div>
      </div>
    </div>
  )
}
