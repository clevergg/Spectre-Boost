export interface Order {
  id: string
  total: number
  date: string
  status: "pending" | "completed" | "cancelled"
  title: string
}

export const orders: Order[] = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    total: 2999,
    status: "completed",
    title: "Буст с платины до мастера",
  },
  {
    id: "ORD-002",
    date: "2024-01-10",
    total: 1599,
    status: "pending",
    title: "Буст с серебра до мастера",
  },
  {
    id: "ORD-003",
    date: "2024-01-05",
    total: 4999,
    status: "completed",
    title: "Буст с золота до мастера",
  },
  {
    id: "ORD-004",
    date: "2024-01-15",
    total: 2999,
    status: "cancelled",
    title: "iPhone Case",
  },
  // {
  //   id: "ORD-005",
  //   date: "2024-01-10",
  //   total: 1599,
  //   status: "pending",
  //   title: "USB-C Cable",
  // },
  // {
  //   id: "ORD-006",
  //   date: "2024-01-05",
  //   total: 4999,
  //   status: "completed",
  //   title: "Wireless Earbuds",
  // },
  // {
  //   id: "ORD-001",
  //   date: "2024-01-15",
  //   total: 2999,
  //   status: "completed",
  //   title: "Буст с платины до мастера",
  // },
  // {
  //   id: "ORD-002",
  //   date: "2024-01-10",
  //   total: 1599,
  //   status: "pending",
  //   title: "Буст с серебра до мастера",
  // },
  // {
  //   id: "ORD-003",
  //   date: "2024-01-05",
  //   total: 4999,
  //   status: "completed",
  //   title: "Буст с золота до мастера",
  // },
  // {
  //   id: "ORD-004",
  //   date: "2024-01-15",
  //   total: 2999,
  //   status: "cancelled",
  //   title: "iPhone Case",
  // },
  // {
  //   id: "ORD-005",
  //   date: "2024-01-10",
  //   total: 1599,
  //   status: "pending",
  //   title: "USB-C Cable",
  // },
  // {
  //   id: "ORD-006",
  //   date: "2024-01-05",
  //   total: 4999,
  //   status: "completed",
  //   title: "Wireless Earbuds",
  // },
]
