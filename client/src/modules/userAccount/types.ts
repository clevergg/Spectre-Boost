export interface User {
  id: string
  username: string
  email: string
  avatar: string
  joinDate: string
}

export interface Order {
  id: string
  date: string
  total: number
  status: Orderstatus
  title: string
}

export type Orderstatus = "pending" | "completed" | "cancelled"
export type TabType = "account" | "orders" | "support"
