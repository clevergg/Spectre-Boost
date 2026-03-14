import type { TabType } from "../types"

interface TabData {
  tab: TabType
  icon: string
  label: string
}

export const TabData: TabData[] = [
  {
    tab: "account",
    icon: "👤",
    label: "Аккаунт",
  },
  {
    tab: "orders",
    icon: "📦",
    label: "Заказы",
  },
  {
    tab: "support",
    icon: "💬",
    label: "Поддержка",
  },
]
