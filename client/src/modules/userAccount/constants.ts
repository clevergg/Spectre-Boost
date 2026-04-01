export const STATUS_CONFIG = {
  PENDING: {
    label: "Ожидание",
    className: "border border-[#F2D04E] text-[#F2D04E]",
  },
  ASSIGNED: {
    label: "Назначен",
    className: "border border-[#4EA8F2] text-[#4EA8F2]",
  },
  IN_PROGRESS: {
    label: "В работе",
    className: "border border-[#4E7CF2] text-[#4E7CF2]",
  },
  COMPLETED: {
    label: "Завершён",
    className: "border border-[#2D531A] text-[#2D531A]",
  },
  CANCELLED: {
    label: "Отменён",
    className: "border border-[#8D0004] text-[#8D0004]",
  },
} as const
