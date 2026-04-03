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
        return null
    }
  }

  const handleChangeTab = useCallback((tab: TabType) => {
    setCurrentTab(tab)
  }, [])

  return (
    <section className='pt-[calc(7rem+7vw)] md:pt-[calc(6rem+6vw)] pb-10 flex-1 w-full lgx:pt-[calc(5rem+5vw)]'>
      <div className='flex flex-col lgx:flex-row w-full max-lgx:space-y-3 transform-gpu lgx:gap-7'>
        <Sidebar currentTab={currentTab} onTabChange={handleChangeTab} />
        <div className='w-full lgx:flex-[2] min-w-0'>{renderContent()}</div>
      </div>
    </section>
  )
}
